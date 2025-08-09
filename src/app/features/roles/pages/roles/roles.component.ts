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
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogFormComponent } from '../../../../shared/component/dialog-form/dialog-form.component';
import { MenuItem } from 'primeng/api';
import { FunctionsConfigComponent } from './functions-config/functions-config.component';
import { DialogConfirmService } from '../../../../core/services/dialog-confirm.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, SharedModule, CoreModule],
  providers: [
    OptionService,
    SystemMessageService,
    DialogService,
    DialogConfirmService,
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
})
export class RolesComponent
  extends BaseInlineEditeTableCompoent
  implements OnInit, OnDestroy
{
  activeFlags: Option[] = []; // Active Flag 的下拉式選單
  types: Option[] = []; // 配置種類的下拉式選單
  dialogOpened: boolean = false; //  Dialog 狀態
  rowActionMenu: MenuItem[] = []; // Table Row Actions 右側選單。
  readonly _destroying$ = new Subject<void>(); // 用來取消訂閱

  autoCompleteList: any[] = [];

  constructor(
    private loadingMaskService: LoadingMaskService,
    private dialogService: DialogService,
    private optionService: OptionService,
    private roleService: RoleService,
    private dialogConfirmService: DialogConfirmService,
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
        disabled: false,
      },
      {
        label: '提交',
        icon: 'pi pi-save',
        command: () => {
          this.submit();
        },
        disabled: false,
      },
      {
        label: '放棄',
        icon: 'pi pi-times',
        command: () => {
          this.cancelAll();
        },
        disabled: false,
      },
      {
        label: '刪除',
        icon: 'pi pi-trash',
        command: () => {
        },
        disabled: false,
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
        required: 'true',
        data: 'types', // 取已選中的 dropdown
      },
      {
        field: 'code',
        header: '角色代碼',
        type: 'inputText',
        required: 'true',
        data: '',
      },
      {
        field: 'name',
        header: '名稱',
        type: 'inputText',
        required: 'true',
        data: '',
      },
      {
        field: 'description',
        header: '說明',
        type: 'textArea',
        required: 'false',
        data: '',
      },
      {
        field: 'activeFlag',
        header: '是否生效',
        type: 'dropdown',
        required: 'true',
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


  /**
   * 清除表單資料
   */
  override clear() {
    this.formGroup.reset();
    this.tableData = [];
    this.minGivenIndex = -1;
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
   * 刪除 Table 資料
   * @param rowData
   */
  protected override remove(rowData: any): void {
    this.dialogConfirmService.confirmDelete(
      () => {
        // 確認後的動作 => 過濾該 givenIndex 的資料
        this.tableData = this.tableData.filter(
          (item) => item.givenIndex !== rowData.givenIndex
        );
      },
      '',
      () => {}
    );
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
   * 切換 編輯模式
   * @param givenIndex
   * @returns
   */
  onEdit(rowData: any) {
    console.log(rowData);
    this.clonedData[rowData.givenIndex] = { ...rowData };
  }


  /**
   * 取消編輯/新增
   * */
  cancel(rowData: any, rowIndex: number) {
    console.log(rowIndex);
    this.tableData[rowIndex] = this.clonedData[rowData.givenIndex];
    delete this.clonedData[rowData.givenIndex];
  }

  /**
   * 回歸原狀，原先新增的資料全部放棄。
   */
  cancelAll() {
  }

  /**
   * 新增一筆空的 row 資料
   * */
  addNewRow(): void {
    this.newRow = {
      id: null,
      name: '',
      type: this.formGroup.get('type')?.value
        ? this.formGroup.get('type')?.value
        : '',
      description: '',
      givenIndex: this.minGivenIndex--, // 前端給予的編號資料
    };
    console.log(this.minGivenIndex);
    this.tableData.unshift(this.newRow);
    // this.onEdit(this.newRow);
    // 觸發該 row 的編輯模式
    setTimeout(() => {
      this.dataTable.initRowEdit(this.newRow);
    });
  }


  /**
   * 進行刪除
   * @param rowIndex
   */
  onDelete(rowIndex: number) {
    this.tableData.splice(rowIndex, 1); // 從陣列刪除指定 row
    this.tableData = [...this.tableData]; // 觸發變更檢測 (避免不刷新)
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
   * 檢查 row 資料是否有未填欄位
   * @param rowData Row 資料
   * */ 
  override checkRowData(selectedData: any): void {
    if (
      !selectedData.type ||
      !selectedData.name ||
      !selectedData.code ||
      !selectedData.description ||
      !selectedData.activeFlag
    ) {
      this.dataTable.initRowEdit(selectedData);  
    }
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
   * @param col 欄資料
   * @returns 
   * */ 
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
