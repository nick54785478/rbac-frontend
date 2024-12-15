import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Option } from '../../../../shared/models/option.model';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { BaseInlineEditeTableCompoent } from '../../../../shared/component/base/base-inline-edit-table.component';
import { RoleService } from '../../services/role.service';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { OptionService } from '../../../../shared/services/option.service';
import { SettingType } from '../../../../core/enums/setting-type.enum';
import { CoreModule } from '../../../../core/core.module';
import { SaveRole } from '../../models/save-role-request.model';
import { finalize } from 'rxjs/internal/operators/finalize';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { FormAction } from '../../../../core/enums/form-action.enum';
import { RoleFunctionsComponent } from '../role-functions/role-functions.component';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogFormComponent } from '../../../../shared/component/dialog-form/dialog-form.component';
import { MenuItem } from 'primeng/api';
import { FunctionsConfigComponent } from './functions-config/functions-config.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, SharedModule, CoreModule],
  providers: [OptionService, SystemMessageService, DialogService],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
})
export class RolesComponent
  extends BaseInlineEditeTableCompoent
  implements OnInit, DoCheck, OnDestroy
{
  activeFlags: Option[] = []; // Active Flag 的下拉式選單
  types: Option[] = []; // 配置種類的下拉式選單
  dialogOpened: boolean = false; //  Dialog 狀態
  rowActionMenu: MenuItem[] = []; // Table Row Actions 右側選單。
  readonly _destroying$ = new Subject<void>(); // 用來取消訂閱

  constructor(
    private loadingMaskService: LoadingMaskService,
    private dialogService: DialogService,
    private optionService: OptionService,
    private roleService: RoleService,
    private messageService: SystemMessageService
  ) {
    super();
  }
  ngOnInit(): void {
    // 初始化上方 Tab 按鈕
    this.detailTabs = [
      {
        label: '新增',
        icon: 'pi pi-plus',
        command: () => {
          this.addNewRow();
        },
        disabled: !(this.mode === '') || this.tableData.length === 0,
      },
      {
        label: '提交',
        icon: 'pi pi-save',
        command: () => {
          this.submit();
        },
        disabled:
          this.tableData.length === 0 ||
          this.mode === 'add' ||
          this.mode === 'edit',
      },
      {
        label: '取消',
        icon: 'pi pi-times',
        command: () => {
          this.cancelAll();
        },
        disabled: this.tableData.length === 0,
      },
      {
        label: '刪除',
        icon: 'pi pi-trash',
        command: () => {
          this.onStartDelete();
        },
        disabled:
          !(this.mode !== 'add') ||
          !(this.mode !== 'edit') ||
          this.tableData.length === 0,
      },
    ];
    // 初始化表單
    this.formGroup = new FormGroup({
      name: new FormControl(''), // 角色名稱
      type: new FormControl(''), // 種類
      activeFlag: new FormControl(''), // 是否生效
    });

    // 初始化 Table 配置
    this.cols = [
      {
        field: 'type',
        header: '配置種類',
        type: 'dropdown',
        data: 'types', // 取已選中的 dropdown
      },
      {
        field: 'code',
        header: '角色代碼',
        type: 'inputText',
        data: '',
      },
      {
        field: 'name',
        header: '名稱',
        type: 'inputText',
        data: '',
      },
      {
        field: 'description',
        header: '說明',
        type: 'textArea',
        data: '',
      },
      {
        field: 'activeFlag',
        header: '是否生效',
        type: 'dropdown',
        data: 'activeFlags',
      },
    ];

    // 初始化 ActiveFlag 下拉選單
    // 取得下拉式選單資料
    this.optionService.getSettingTypes(SettingType.YES_NO).subscribe({
      next: (res) => {
        this.activeFlags = res;
      },
      error: (error) => {
        this.messageService.error('取得資料發生錯誤', error.message);
      },
    });

    // 取得下拉式選單資料
    this.optionService.getSettingTypes(SettingType.ROLE).subscribe({
      next: (res) => {
        this.types = res;
      },
      error: (error) => {
        this.messageService.error('取得資料發生錯誤', error.message);
      },
    });
  }

  ngDoCheck(): void {
    this.detailTabs = [
      {
        label: '新增',
        icon: 'pi pi-plus',
        // 當沒有表單資料，不能新增
        disabled: !(this.mode === '') || this.tableData.length === 0,
        command: () => {
          this.addNewRow();
        },
      },
      {
        label: '提交',
        icon: 'pi pi-save',
        command: () => {
          this.submit();
        },
        // 當在新增或編輯模式時，不能提交
        disabled:
          this.tableData.length === 0 ||
          this.mode === 'add' ||
          this.mode === 'edit',
      },
      {
        label: '取消',
        icon: 'pi pi-times',
        command: () => {
          this.cancelAll();
        },
        disabled: this.tableData.length === 0,
      },
      {
        label: '刪除',
        icon: 'pi pi-trash',
        command: () => {
          this.onStartDelete();
        },
        disabled:
          !(this.mode !== 'add') ||
          !(this.mode !== 'edit') ||
          this.tableData.length === 0,
      },
    ];
  }

  /**
   * 清除表單資料
   */
  override clear() {
    // this.formGroup.reset();
    this.formGroup.setValue({
      name: '', // 角色名稱
      type: '', // 種類
      activeFlag: '', // 是否生效
    });

    this.tableData = [];
    this.selectedIndex = -1;
    this.selectedData = null;
    this.editingIndex = -1;
    this.editingRow = null;
    this.mode = '';
  }

  ngOnDestroy() {}

  // 提交資料
  override submit() {
    // 刪除模式的提交
    if (this.mode === 'delete') {
      this.delete(this.deleteList);
      return;
    }

    this.submitted = true;
    const requestData: SaveRole[] = this.tableData.map((data) => {
      return {
        id: data.id,
        code: data.code,
        type: data.type,
        name: data.name,
        description: data.description,
        activeFlag: data.activeFlag,
      };
    });

    if (this.submitted) {
      this.loadingMaskService.show();
      this.roleService
        .submit(requestData)
        .pipe(
          finalize(() => {
            // 無論成功或失敗都會執行
            this.submitted = false;
            this.loadingMaskService.hide();
            this.query();
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.code === 'VALIDATION_FAILED') {
              this.messageService.error(res.message);
            } else {
              this.messageService.success(res.message);
            }
          },
          error: (error) => {
            this.messageService.error(error.message);
          },
        });
    }
  }

  /**
   * 透過特定條件查詢設定資料
   */
  query() {
    this.loadingMaskService.show();
    // 查詢前先取消所有
    this.cancelAll();
    let formData = this.formGroup.value;
    this.roleService
      .query(formData.type, formData.name, formData.activeFlag)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.loadingMaskService.hide();
        })
      )
      .subscribe({
        next: (res) => {
          this.messageService.success('查詢成功');
          this.tableData = res;
          console.log(this.tableData);
        },
        error: (error) => {
          this.messageService.error(error.message);
        },
      });
  }

  onEdit(rowIndex: number) {
    // 若目前為 新增模式 pass
    if (this.mode === 'add' || this.mode === 'delete') {
      return;
    }

    // 避免當我進入編輯模式後，再點擊其他列導致進入其他列的編輯模式
    if (this.mode === 'edit' && rowIndex !== this.editingIndex) {
      return;
    }

    // 進入編輯模式
    this.mode = 'edit';

    if (typeof rowIndex === 'number') {
      // 選取的 rowIndex
      this.selectedIndex = rowIndex;
      // 被編輯的 row 資料
      this.editingIndex = rowIndex;
    }
    this.selectedData = this.tableData[rowIndex];
    this.editingRow = { ...this.selectedData }; // 深拷貝選中的行資料，避免直接修改原始數據
  }

  /**
   * 取消編輯
   */
  cancelEdit() {
    if (!this.editingRow) {
      return;
    }
    // 透過 editingRow 回覆上次修改的資料
    this.tableData.forEach((e) => {
      if (e.id === this.editingRow.id) {
        e.type = this.editingRow.type;
        e.name = this.editingRow.name;
        e.code = this.editingRow.code;
        e.activeFlag = this.editingRow.activeFlag;
        e.description = this.editingRow.description;
      }
    });

    // 取消，解除模式
    this.mode = '';
  }

  /**
   * 取消編輯/新增
   * */
  cancel(rowIndex?: number) {
    if (this.mode === 'edit') {
      this.cancelEdit();
    } else if (this.mode === 'add' && rowIndex) {
      this.cancelAdd(rowIndex);
    }

    this.editingIndex = -1;
    this.editingRow = null;
  }

  /**
   * 回歸原狀，原先新增的資料全部放棄。
   */
  cancelAll() {
    this.deleteList = [];
    this.mode = '';
    this.newRow = '';
    this.newRowIndexes = [];
    this.selectedData = null;
    this.selectedIndex = -1;
    this.editingIndex = -1;
    this.editingRow = [];
    this.tableData = this.tableData.filter((data) => data.id !== null);
  }

  /**
   * 判斷是否為編輯模式
   * */
  isEditing(rowIndex: any): boolean {
    return this.editingIndex === rowIndex;
  }

  /**
   * 判斷是否為新增模式
   * @param rowData 當前的 row 資料
   * */
  isAdding(rowData: any) {
    // 這裡要使用 givenIndex ，因 Table 的 index 會隨資料數量改變
    return !rowData.id && this.newRowIndexes.includes(rowData.givenIndex);
    // rowIndex !== rowData.givenIndex;
  }

  /**
   * 確認編輯/新增
   * @param rowIndex 當前 row 的 Index
   * */
  confirm(rowIndex: number) {
    // 當新增模式會將資料更新為最新的空資料，因為前面進新增模式時未 select
    if (this.mode === 'add') {
      // 更新為該筆資料
      this.newRow = this.tableData[rowIndex];

      console.log(this.checkRowData(this.newRow));

      // 新增模式下有欄位為空值，不予以 Confirm
      if (!this.checkRowData(this.tableData[rowIndex])) {
        return;
      }

      // 過濾掉該 rowIndex
      this.newRowIndexes = this.newRowIndexes.filter(
        (index) => index !== rowIndex
      );
    }

    // 編輯模式，檢查資料
    if (this.mode === 'edit' && !this.checkRowData(this.selectedData)) {
      return;
    }
    this.newRow = null;
    this.editingIndex = -1;
    this.editingRow = null;

    // newRowIndexes 裡面還有資料，代表不能解除更新資料
    if (this.newRowIndexes.length > 0) {
      return;
    }

    // 解除特定模式
    this.mode = '';
  }

  /**
   * 新增一筆空的 row 資料
   * */
  addNewRow(): void {
    // 如果是編輯或刪除模式，就不新增資料
    if (this.mode === 'edit' || this.mode === 'delete') {
      return;
    }

    // 設定模式為 新增模式
    this.mode = 'add';
    this.newRow = {
      id: null,
      name: '',
      type: '',
      description: '',
      givenIndex: this.tableData.length, // 前端給予的編號資料
    };

    // 將 index 加入 newRowIndexes，用以紀錄更新資料的 index
    this.newRowIndexes.push(this.newRow.givenIndex);
    // 將此資料推入 tableData
    this.tableData.push(this.newRow);
  }

  /**
   * 進行刪除
   */
  onStartDelete() {
    this.mode = 'delete';
  }

  /**
   * 進行刪除
   * @param id
   * @param isSelected 是否被選中
   */
  onDelete(id: number, isSelected: boolean) {
    // 如果不包含該 id 加入
    if (isSelected) {
      // 若選中，添加到陣列
      this.deleteList.push(id);
    } else {
      // 若取消選中，從陣列移除
      this.deleteList = this.deleteList.filter((e) => e !== id);
    }
    console.log(this.deleteList);
  }

  // 刪除幾列資料
  override delete(ids: number[], event?: Event) {
    this.roleService
      .delete(ids)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.query();
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.code === 'VALIDATION_FAILED') {
            this.messageService.error(res.message);
          } else {
            this.messageService.success(res.message);
          }
        },
        error: (error) => {
          this.messageService.error(error.message);
        },
      });
  }

  /**
   * 移除 id = null 的值
   * 用於移除新列 (row)
   *
   * @param rowIndex 當前 row 資料的 index
   */
  cancelAdd(rowIndex: number) {
    if (this.mode === 'add') {
      // 過濾出 id != null 者 (現有資料) 及 沒被選上的資料
      this.tableData = this.tableData.filter(
        (data) => data.id !== null || data?.givenIndex !== rowIndex
      );
      // 過濾掉該 rowIndex
      this.newRowIndexes = this.newRowIndexes.filter(
        (index) => index !== rowIndex
      );
    }
    // reset 新增資料
    this.newRow = null;

    // newRowIndexes 裡面還有資料，代表不能解除新增模式
    if (this.newRowIndexes.length > 0) {
      return;
    }

    this.mode = '';
  }

  // 檢查 row 資料是否有未填欄位
  override checkRowData(selectedData: any): boolean {
    if (
      !selectedData.type ||
      !selectedData.name ||
      !selectedData.code ||
      !selectedData.description ||
      !selectedData.activeFlag
    ) {
      return false;
    }
    return true;
  }

  /**
   * 判斷Type欄位是否可修改
   * @param rowData 該 row 的資料
   * @param field 欄位名稱
   * @returns
   */
  isFieldDisabled(rowData: any, field: string): boolean {
    if (
      (field === 'type' &&
        rowData.id !== null &&
        this.formGroup.get('type')?.value !== '') ||
      (rowData.id !== null && this.formGroup.get('name')?.value !== '')
    ) {
      return true;
    }
    return false;
  }

  // 載入 dropdown 資料
  override loadDropdownData(col: any): any[] {
    console.log(col.field);

    // 如果已經載入過資料，則不再重新請求
    switch (col.field) {
      case 'type':
        return this.types;
      case 'activeFlag':
        return this.activeFlags;
      default:
        return [];
    }
  }

  /**
   * Table Action 按鈕按下去的時候要把該筆資料記錄下來。
   * @param rowData 點選的資料
   */
  clickRowActionMenu(rowData: any): void {
    this.selectedData = rowData;

    // 開啟 Dialog
    this.openFormDialog(this.selectedData);
  }

  /**
   * 開啟 Dialog 表單
   * @returns DynamicDialogRef
   */
  openFormDialog(data?: number): DynamicDialogRef {
    this.dialogOpened = true;

    console.log(data);

    const ref = this.dialogService.open(DialogFormComponent, {
      header: '角色功能配置',
      width: '60%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: data,
      templates: {
        content: FunctionsConfigComponent,
      },
    });
    // Dialog 關閉後要做的事情
    ref?.onClose
      .pipe(takeUntil(this._destroying$))
      .subscribe((returnData: any) => {
        console.log('關閉 Dialog');
        this.dialogOpened = false;
      });
    return ref;
  }
}
