import {
  Component,
  DoCheck,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BaseInlineEditeTableCompoent } from '../../../../shared/component/base/base-inline-edit-table.component';
import { OptionService } from '../../../../shared/services/option.service';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { finalize } from 'rxjs/internal/operators/finalize';
import { GroupsService } from '../../services/groups.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SettingType } from '../../../../core/enums/setting-type.enum';
import { Option } from '../../../../shared/models/option.model';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { SaveGroup } from '../../models/save-groups-request.model';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogFormComponent } from '../../../../shared/component/dialog-form/dialog-form.component';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { MenuItem } from 'primeng/api';
import { Subject } from 'rxjs/internal/Subject';
import { RolesConfigComponent } from './roles-config/roles-config.component';
import { OverlayPanel } from 'primeng/overlaypanel';
import { StorageService } from '../../../../core/services/storage.service';
import { CustomisationService } from '../../../../shared/services/customisation.service';
import { SystemStorageKey } from '../../../../core/enums/system-storage.enum';
import { UpdateCustomisation } from '../../../../shared/models/update-customisation-request.model';
import { map } from 'rxjs/internal/operators/map';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, SharedModule, CoreModule],
  providers: [
    SystemMessageService,
    OptionService,
    GroupsService,
    DialogService,
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent
  extends BaseInlineEditeTableCompoent
  implements OnInit, OnDestroy
{
  static readonly COMPONENT_NAME = 'GroupsComponent'; // Component 名稱
  services: Option[] = [];
  activeFlags: Option[] = []; // Active Flag 的下拉式選單
  types: Option[] = []; // 配置種類的下拉式選單
  dialogOpened: boolean = false; //  Dialog 狀態
  rowActionMenu: MenuItem[] = []; // Table Row Actions 右側選單。
  readonly _destroying$ = new Subject<void>(); // 用來取消訂閱

  // 控制 OverlayPanel
  @ViewChild('fieldPanel') fieldPanel!: OverlayPanel;

  // Field 顯示設定清單
  fields: any[] = [];
  selectedFields: any[] = []; // 被選中的欄位
  fieldViews: any[] = [];
  filteredCols: any[] = [];

  constructor(
    private storageService: StorageService,
    private customisationService: CustomisationService,
    private groupService: GroupsService,
    private dialogService: DialogService,
    private optionService: OptionService,
    private loadMaskService: LoadingMaskService,
    private messageService: SystemMessageService
  ) {
    super();
  }
  ngOnInit(): void {
    // 取得下拉式選單資料
    this.optionService
      .getSettingTypes('AUTH_SERVICE', SettingType.GROUP)
      .subscribe({
        next: (res) => {
          this.types = res;
        },
        error: (error) => {
          this.messageService.error(error);
        },
      });
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
    ];

    // 初始化表單
    this.formGroup = new FormGroup({
      service: new FormControl('', Validators.required),
      name: new FormControl(''), // 角色名稱
      type: new FormControl({ value: '', disabled: true }), // 種類
      activeFlag: new FormControl(''), // 是否生效
    });

    // 監聽 service 變更，變更後要更新 Type 的下拉選單資料
    this.formGroup.get('service')?.valueChanges.subscribe((serviceValue) => {
      const control = this.formGroup.get('type');
      if (serviceValue) {
        control?.enable(); // 選擇 service -> 啟用 type
        this.optionService
          .getSettingTypes(serviceValue, SettingType.GROUP)
          .subscribe({
            next: (res) => {
              this.types = res;
            },
            error: (error) => {
              this.messageService.error('取得資料發生錯誤', error.message);
            },
          });
      } else {
        control?.reset(); // 清空角色
        control?.disable(); // 禁用 type
      }
    });

    // 初始化 Table 配置
    this.cols = [
      {
        field: 'service',
        header: '服務',
        type: 'dropdown',
        width: '10rem',
        required: 'true',
        readOnly: true,
      },
      {
        field: 'type',
        header: '配置種類',
        type: 'dropdown',
        width: '10rem',
        required: 'true',
        readOnly: false,
      },
      {
        field: 'code',
        header: '群組代碼',
        type: 'inputText',
        width: '10rem',
        required: 'true',
        readOnly: false,
      },
      {
        field: 'name',
        header: '名稱',
        type: 'inputText',
        width: '10rem',
        required: 'true',
        readOnly: false,
      },
      {
        field: 'description',
        header: '說明',
        type: 'textArea',
        width: '15rem',
        required: 'true',
        readOnly: false,
      },
      {
        field: 'activeFlag',
        header: '生效',
        type: 'dropdown',
        width: '4rem',
        required: 'true',
        readOnly: false,
      },
    ];

    // 將 cols 映射成 fields
    this.fields = this.cols.map((col) => ({
      field: col.field,
      label: col.header,
    }));

    // 初始化 ActiveFlag 下拉選單
    this.optionService
      .getSettingTypes('AUTH_SERVICE', SettingType.YES_NO)
      .subscribe({
        next: (options) => {
          this.activeFlags = options;
        },
        error: (err) => {
          console.error('Failed to load dropdown data:', err);
        },
      });
    this.optionService
      .getSettingTypes('AUTH_SERVICE', SettingType.SERVICE)
      .subscribe({
        next: (res) => {
          this.services = res;
        },
        error: (error) => {
          this.messageService.error('取得資料發生錯誤', error.message);
        },
      });

    this.getFieldViewCustomisation();
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
    this.submitted = true;
    if (this.formGroup.invalid || !this.submitted) {
      return;
    }
    const requestData: SaveGroup[] = this.tableData.map((data) => {
      return {
        id: data.id,
        service: data.service,
        code: data.code,
        type: data.type,
        name: data.name,
        description: data.description,
        activeFlag: data.activeFlag,
      };
    });

    if (!this.submitted || this.mode) {
      return;
    }
    this.loadMaskService.show();

    this.groupService
      .submit(requestData)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.loadMaskService.hide();
          this.submitted = false;
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
   * 透過特定條件查詢設定資料
   */
  query() {
    this.submitted = true;
    if (this.formGroup.invalid || !this.submitted) {
      return;
    }
    // 查詢前先取消所有
    this.cancelAll();
    let formData = this.formGroup.value;
    this.loadMaskService.show();
    this.groupService
      .query(
        formData.service,
        formData.type,
        formData.name,
        formData.activeFlag
      )
      .pipe(
        finalize(() => {
          this.submitted = false;
          this.loadMaskService.hide();
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
    this.mode = 'edit';
  }

  /**
   * 取消編輯/新增
   * */
  cancel(rowData: any, rowIndex: number) {
    const cloned = this.clonedData[rowData.givenIndex];
    if (cloned) {
      // 如果有 clone，就還原
      this.tableData[rowIndex] = cloned;
      delete this.clonedData[rowData.givenIndex];
    } else {
      // 如果沒有 clone，代表是新加的資料 => 直接刪掉這筆
      this.tableData.splice(rowIndex, 1);
    }
    this.mode = '';
  }

  /**
   * 回歸原狀，原先新增的資料全部放棄。
   */
  cancelAll() {
    // 基本上 givenIndex < 0 者都是新增的資料
    this.dataTable.editingRowKeys = {};
    this.tableData = this.tableData.filter((data) => data.givenIdex >= 0);
  }

  /**
   * 新增一筆空的 row 資料
   * */
  addNewRow(): void {
    this.mode = 'add';
    this.newRow = {
      id: null,
      service: this.formGroup.get('service')?.value
        ? this.formGroup.get('service')?.value
        : '',
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

  // 檢查 row 資料是否有未填欄位
  override checkRowData(selectedData: any): void {
    if (
      !selectedData.service ||
      !selectedData.type ||
      !selectedData.name ||
      !selectedData.code ||
      !selectedData.description ||
      !selectedData.activeFlag
    ) {
      this.dataTable.initRowEdit(selectedData);
    } else {
      // 通過取消 mode
      this.mode = '';
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

  // 載入 dropdown 資料
  override loadDropdownData(col: any): any[] {
    // 如果已經載入過資料，則不再重新請求
    switch (col.field) {
      case 'type':
        return this.types;
      case 'activeFlag':
        return this.activeFlags;
      case 'service':
        return this.services;
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
  openFormDialog(data?: any): DynamicDialogRef {
    this.dialogOpened = true;

    console.log(data);

    const ref = this.dialogService.open(DialogFormComponent, {
      header: '群組角色配置',
      width: '60%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: data,
      templates: {
        content: RolesConfigComponent,
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

  // 隱藏 Field 設定清單
  closePanel() {
    this.fieldPanel.hide();
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
    let component = GroupsComponent.COMPONENT_NAME;

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
    let component = GroupsComponent.COMPONENT_NAME;
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
}
