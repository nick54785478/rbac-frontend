import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { FunctionsService } from '../../services/functions.service';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Option } from '../../../../shared/models/option.model';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { BaseInlineEditeTableCompoent } from '../../../../shared/component/base/base-inline-edit-table.component';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { OptionService } from '../../../../shared/services/option.service';
import { SettingType } from '../../../../core/enums/setting-type.enum';
import { CoreModule } from '../../../../core/core.module';
import { finalize } from 'rxjs/internal/operators/finalize';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { SaveFunction } from '../../models/save-functions-request.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { error } from 'console';

@Component({
  selector: 'app-functions',
  standalone: true,
  imports: [CommonModule, SharedModule, CoreModule],
  providers: [SystemMessageService, OptionService],
  templateUrl: './functions.component.html',
  styleUrl: './functions.component.scss',
})
export class FunctionsComponent
  extends BaseInlineEditeTableCompoent
  implements OnInit, DoCheck, OnDestroy
{
  constructor(
    private loadingMaskService: LoadingMaskService,
    private optionService: OptionService,
    private functionService: FunctionsService,
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
        disabled: !(this.mode === ''),
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
        label: '放棄',
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
      actionType: new FormControl(''), // 動作種類
      type: new FormControl(''), // 種類
      name: new FormControl(''), // 功能名稱
      activeFlag: new FormControl(''), // 是否生效
    });

    // 初始化 Table 配置
    this.cols = [
      {
        field: 'type',
        header: '配置種類',
        type: 'dropdown',
      },
      {
        field: 'actionType',
        header: '動作',
        type: 'dropdown',
      },

      {
        field: 'code',
        header: '功能代碼',
        type: 'inputText',
      },
      {
        field: 'name',
        header: '名稱',
        type: 'inputText',
      },
      {
        field: 'description',
        header: '說明',
        type: 'textArea',
      },
      {
        field: 'activeFlag',
        header: '是否生效',
        type: 'dropdown',
      },
    ];

    // 初始化 ActiveFlag 下拉選單
    this.optionService.getSettingTypes(SettingType.FUNCTION).subscribe({
      next: (res) => {
        this.types = res;
      },
      error: (error) => {
        this.messageService.error(error);
      },
    });

    this.optionService.getSettingTypes(SettingType.YES_NO).subscribe({
      next: (res) => {
        this.activeFlags = res;
      },
      error: (error) => {
        this.messageService.error(error);
      },
    });

    this.optionService.getSettingTypes(SettingType.ACTION_TYPE).subscribe({
      next: (res) => {
        this.actionTypes = res;
      },
      error: (error) => {
        this.messageService.error(error);
      },
    });
  }

  ngDoCheck(): void {
    this.detailTabs = [
      {
        label: '新增',
        icon: 'pi pi-plus',
        // 當沒有表單資料，不能新增
        disabled: !(this.mode === ''),
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
        label: '放棄',
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

  // Active Flag 的下拉式選單
  activeFlags: Option[] = [];
  // 配置種類的下拉式選單
  types: Option[] = [];
  // ActionTypes 的下拉式選單
  actionTypes: Option[] = [];

  /**
   * 清除表單資料
   */
  override clear() {
    // this.formGroup.reset();
    this.formGroup.setValue({
      name: '', // 功能名稱
      type: '', // 種類
      actionType: '',
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
    const requestData: SaveFunction[] = this.tableData.map((data) => {
      return {
        id: data.id,
        actionType: data.actionType,
        code: data.code,
        type: data.type,
        name: data.name,
        description: data.description,
        activeFlag: data.activeFlag,
      };
    });

    if (this.submitted) {
      this.loadingMaskService.show();
      this.functionService
        .submit(requestData)
        .pipe(
          finalize(() => {
            this.submitted = false;
            this.loadingMaskService.hide();
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
  }

  /**
   * 透過特定條件查詢設定資料
   */
  query() {
    this.loadingMaskService.show();
    // 查詢前先取消所有
    this.cancelAll();
    let formData = this.formGroup.value;
    this.functionService
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
          // 對所有資料進行編號
          for (var i = 0; i < this.tableData.length; i++) {
            this.tableData[i].givenIndex = i;
          }

          console.log(this.tableData);
        },
        error: (error) => {
          this.messageService.error(error.message);
        },
      });
  }

  /**
   * 進入 編輯模式
   * @param givenIndex
   * @returns
   */
  onEdit(givenIndex: number) {
    // 若目前為 新增模式 pass
    if (this.mode === 'add' || this.mode === 'delete') {
      return;
    }

    // 避免當我進入編輯模式後，再點擊其他列導致進入其他列的編輯模式
    if (this.mode === 'edit' && givenIndex !== this.editingIndex) {
      return;
    }

    // 進入編輯模式
    this.mode = 'edit';

    if (typeof givenIndex === 'number') {
      // 選取的 rowIndex
      this.selectedIndex = givenIndex;
      // 被編輯的 row 資料
      this.editingIndex = givenIndex;
    }

    this.selectedData = this.tableData.find(
      (data) => data.givenIndex === givenIndex
    );
    this.editingRow = { ...this.selectedData }; // 深拷貝選中的行資料，避免直接修改原始數據
  }

  /**
   * 判斷是否為編輯模式
   * @param givenIndex
   * */
  isEditing(givenIndex: any): boolean {
    return this.editingIndex === givenIndex;
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
      if (
        e.id === this.editingRow.id &&
        e.givenIndex === this.editingRow.givenIndex
      ) {
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
   *
   * @param givenIndex
   * */
  cancel(givenIndex?: number) {
    console.log(givenIndex);
    console.log(this.editingIndex);
    if (this.mode === 'edit') {
      this.cancelEdit();
    } else if (
      this.mode === 'add' &&
      givenIndex !== -1 &&
      givenIndex !== undefined
    ) {
      this.cancelAdd(givenIndex);
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
   * 確認編輯/新增
   * @param givenIndex 當前 row 的 Index
   * */
  confirm(givenIndex: number) {
    console.log(this.newRow);

    // 當新增模式會將資料更新為最新的空資料，因為前面進新增模式時未 select
    if (this.mode === 'add') {
      // 更新為該筆資料
      this.newRow = this.tableData.find(
        (data) => data.givenIndex === givenIndex
      );

      console.log(this.checkRowData(this.newRow));

      // 新增模式下 有欄位為空值，不予以 Confirm
      if (!this.checkRowData(this.newRow)) {
        return;
      }

      // 過濾掉該 rowIndex
      this.newRowIndexes = this.newRowIndexes.filter(
        (index) => index !== givenIndex
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
   * Table Action 按鈕按下去的時候要把該筆資料記錄下來。
   * @param rowData 點選的資料
   */
  clickRowActionMenu(rowData: any): void {
    this.selectedData = rowData;

    // // 開啟 Dialog
    // this.openFormDialog(this.selectedData);
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
      actionType: '',
      name: '',
      type: this.formGroup.get('type')?.value
        ? this.formGroup.get('type')?.value
        : '',
      description: '',
      givenIndex: 0, // 前端給予的編號資料
      // givenIndex: this.tableData.length, // 前端給予的編號資料
    };
    console.log(this.newRow);

    // 所有編號往後推一號
    this.tableData.forEach((e) => {
      e.givenIndex += 1;
    });

    // 將 index 加入 newRowIndexes，用以紀錄更新資料的 index
    this.newRowIndexes.push(this.newRow.givenIndex);
    // 將此資料推入 tableData
    this.tableData.push(this.newRow);
    // 根據 givenIndex 重排序
    this.tableData.sort((a, b) => {
      if (a.givenIndex < b.givenIndex) {
        return -1; // a 排在 b 前
      } else if (a.givenIndex > b.givenIndex) {
        return 1; // b 排在 a 前
      } else {
        return 0; // 保持順序
      }
    });
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
    this.functionService
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
   * @param giveIndex 當前 row 資料的 index
   */
  cancelAdd(giveIndex: number) {
    if (this.mode === 'add') {
      // 過濾出 id != null 者 (現有資料) 及 沒被選上的資料
      this.tableData = this.tableData.filter(
        (data) => data.id !== null || data?.givenIndex !== giveIndex
      );
      // 過濾掉該 giveIndex 的資料
      this.newRowIndexes = this.newRowIndexes.filter(
        (index) => index !== giveIndex
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
      !selectedData.actionType ||
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

  /**
   * 載入 dropdown 資料
   * @param col
   * @returns
   */
  override loadDropdownData(col: any): any[] {
    // 如果已經載入過資料，則不再重新請求
    switch (col.field) {
      case 'type':
        return this.types;
      case 'activeFlag':
        return this.activeFlags;
      case 'actionType':
        return this.actionTypes;
      default:
        return [];
    }
  }
}
