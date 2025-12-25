import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { OptionService } from '../../../../shared/services/option.service';
import { Option } from '../../../../shared/models/option.model';
import { SettingService } from '../../service/setting.service';
import { SettingQueried } from '../../models/setting-query.model';
import { MenuItem } from 'primeng/api';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { DialogFormComponent } from '../../../../shared/component/dialog-form/dialog-form.component';
import { FormAction } from '../../../../core/enums/form-action.enum';
import { SettingFormComponent } from './setting-form/setting-form.component';
import { DialogConfirmService } from '../../../../core/services/dialog-confirm.service';
import { SettingType } from '../../../../core/enums/setting-type.enum';
import { CommonModule } from '@angular/common';
import { BaseFormCompoent } from '../../../../shared/component/base/base-form.component';
import { CustomisationService } from '../../../../shared/services/customisation.service';
import { SystemStorageKey } from '../../../../core/enums/system-storage.enum';
import { OverlayPanel } from 'primeng/overlaypanel';
import { StorageService } from '../../../../core/services/storage.service';
import { UpdateCustomisation } from '../../../../shared/models/update-customisation-request.model';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [SharedModule, CoreModule, CommonModule],
  providers: [
    DialogService,
    DialogConfirmService,
    DynamicDialogConfig,
    SystemMessageService,
    OptionService,
    DynamicDialogRef,
  ],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss',
})
export class SettingComponent
  extends BaseFormCompoent
  implements OnInit, OnDestroy
{
  static readonly COMPONENT_NAME = 'SettingComponent'; // Component 名稱
  dataTypes: Option[] = [];
  activeFlags: Option[] = [];
  services: Option[] = [];
  //Table Row Actions 選單。
  rowActionMenu: MenuItem[] = [];

  // 控制 OverlayPanel
  @ViewChild('fieldPanel') fieldPanel!: OverlayPanel;

  protected detailTabs: MenuItem[] = []; // Table 上方頁簽

  /**
   * 用來取消訂閱
   */
  readonly _destroying$ = new Subject<void>();

  // 現在選取的那一筆
  rowCurrentData: any;

  tableData: SettingQueried[] = []; // 查詢表格資料
  cols: any[] = []; // 表格資訊
  selectedData: [] = []; // 選擇資料清單

  dialogOpened: boolean = false;

  // Field 顯示設定清單
  fields: any[] = [];
  selectedFields: any[] = []; // 被選中的欄位
  fieldViews: any[] = [];
  filteredCols: any[] = [];

  // override formAction!: FormAction; // Dialog 操作

  constructor(
    private dialogConfirmService: DialogConfirmService,
    private dynamicDialogRef: DynamicDialogRef,
    public dialogService: DialogService,
    private optionService: OptionService,
    private settingService: SettingService,
    public messageService: SystemMessageService,
    private customisationService: CustomisationService,
    private storageService: StorageService
  ) {
    super();
  }

  ngOnDestroy(): void {
    // 保證組件銷毀時關閉 Dialog
    if (this.dynamicDialogRef) {
      this.dynamicDialogRef.close();
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      service: new FormControl('', [Validators.required]),
      dataType: new FormControl(''),
      code: new FormControl(''),
      value: new FormControl(''),
      type: new FormControl(''),
      name: new FormControl(''),
      activeFlag: new FormControl(''),
    });

    // 取得 DataTypes 下拉資料
    this.optionService.getDataTypes().subscribe((res) => {
      this.dataTypes = res;
    });

    // 取得 Services 下拉選單
    this.optionService
      .getSettingTypes('AUTH_SERVICE', SettingType.SERVICE)
      .subscribe((res) => {
        this.services = res;
      });

    // 取得 activeFlag 下拉資料
    this.optionService
      .getSettingTypes('AUTH_SERVICE', SettingType.YES_NO)
      .subscribe((res) => {
        this.activeFlags = res;
      });

    this.cols = [
      // { field: 'service', header: '服務', width: '10rem' },
      { field: 'dataType', header: '配置種類', width: '10rem' },
      { field: 'type', header: '類別', width: '10rem' },
      { field: 'name', header: '名稱', width: '10rem' },
      { field: 'code', header: '代碼', width: '10rem' },
      { field: 'value', header: '值', width: '10rem' },
      { field: 'description', header: '說明', width: '15rem' },
      { field: 'priorityNo', header: '排序', width: '5rem' },
    ];

    // 初始化上方 Tab 按鈕
    this.detailTabs = [
      {
        label: '欄位',
        icon: 'pi pi-filter',
        command: () => {
          this.fieldPanel.toggle(event);
        },
        disabled: false,
      },
    ];

    // 將 cols 映射成 fields
    this.fields = this.cols.map((col) => ({
      field: col.field,
      label: col.header,
    }));

    // 取得個人化 Table 欄位顯示資料
    this.getFieldViewCustomisation();
  }

  /**
   * 開啟 Dialog 表單
   * @returns DynamicDialogRef
   */
  openFormDialog(formAction?: FormAction, data?: any): DynamicDialogRef {
    this.dialogOpened = true;

    const ref = this.dialogService.open(DialogFormComponent, {
      header: formAction === FormAction.ADD ? '新增一筆資料' : '更新一筆資料',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        action: formAction,
        data: data,
      },
      templates: {
        content: SettingFormComponent,
      },
    });
    // Dialog 關閉後要做的事情
    ref?.onClose
      .pipe(takeUntil(this._destroying$))
      .subscribe((returnData: any) => {
        console.log('關閉 Dialog');
        this.dialogOpened = false;
        console.log(returnData);

        this.query();
      });
    return ref;
  }

  /**
   * 新增一筆設定資料表單
   */
  onAdd() {
    this.openFormDialog(FormAction.ADD);
  }

  /**
   * 編輯一筆設定資料
   */
  onEdit() {
    this.openFormDialog(FormAction.EDIT, this.rowCurrentData);
  }

  /**
   * 關閉 Dialog 表單
   */
  closeFormDialog() {
    this.dialogOpened = false;
    this.dynamicDialogRef.close();
    console.log('關閉 Dialog 表單');
  }

  /**
   * 清除表單資料
   */
  clear() {
    this.formGroup.reset();
    this.tableData = [];
  }

  /**
   * 透過特定條件查詢設定資料
   */
  query() {
    this.submitted = true;
    let formData = this.formGroup.value;

    if (!this.submitted || this.formGroup.invalid) {
      return;
    }
    this.settingService
      .query(
        formData.service,
        formData.dataType,
        formData.type,
        formData.name,
        formData.activeFlag
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

  /**
   * Table Action 按鈕按下去的時候要把該筆資料記錄下來。
   * @param rowData 點選的資料
   */
  clickRowActionMenu(rowData: any): void {
    // console.log('clickRowActionMenu rowData = ' + JSON.stringify(rowData));
    this.rowCurrentData = rowData;
    console.log(this.rowCurrentData);

    // 開啟 Dialog
    this.openFormDialog(FormAction.EDIT, this.rowCurrentData);
  }

  /**
   * 刪除特定資料
   * @param id
   */
  delete(id: number) {
    console.log(id);
    this.dialogConfirmService.confirmDelete(() => {
      // 確認後的動作
      this.settingService.delete(id).subscribe({
        next: (res) => {
          this.messageService.success(res.message);
          // 再查一次
          this.query();
        },
        error: (error) => {
          this.messageService.error(error.message);
        },
      });
    });
  }

  /**
   * 提交 Fields 設定
   */
  submitFields() {
    console.log(this.selectedFields);
    const username =
      this.storageService.getSessionStorageItem(SystemStorageKey.USERNAME) ||
      this.storageService.getLocalStorageItem(SystemStorageKey.USERNAME) ||
      '';
    // 取得 Component 名稱
    let component = SettingComponent.COMPONENT_NAME;

    let requestData: UpdateCustomisation = {
      username: username,
      component: component,
      type: 'FieldView',
      valueList: this.selectedFields,
    };

    this.customisationService
      .updateCustomisation(requestData)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.getFieldViewCustomisation();
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
   * 取得 Table Field View 配置
   */
  getFieldViewCustomisation() {
    const username =
      this.storageService.getSessionStorageItem(SystemStorageKey.USERNAME) ||
      this.storageService.getLocalStorageItem(SystemStorageKey.USERNAME) ||
      '';
    // 取得 Component 名稱
    let component = SettingComponent.COMPONENT_NAME;
    console.log(username, component);
    this.customisationService
      .getFieldViewCustomisations(username, component)
      .subscribe((res) => {
        this.fieldViews = res.map((data) => data.field);
        this.selectedFields = res;
        // 只保留在 viewCols 中的欄位
        this.filteredCols = this.cols.filter((col) =>
          this.fieldViews.includes(col.field)
        );
      });
    this.closePanel();
  }

  // 隱藏 Field 設定清單
  closePanel() {
    this.fieldPanel.hide();
  }
}
