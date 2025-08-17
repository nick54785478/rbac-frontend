import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
import { NavigationStart, Router } from '@angular/router';
import { Location } from '@angular/common';
import { response } from 'express';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [SharedModule, CoreModule],
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
export class SettingComponent implements OnInit, OnDestroy {
  dataTypes: Option[] = [];
  activeFlags: Option[] = [];
  //Table Row Actions 選單。
  rowActionMenu: MenuItem[] = [];

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

  formAction!: FormAction; // Dialog 操作

  constructor(
    private dialogConfirmService: DialogConfirmService,
    private dynamicDialogRef: DynamicDialogRef,
    public dialogService: DialogService,
    private optionService: OptionService,
    private settingService: SettingService,
    public messageService: SystemMessageService
  ) {}

  ngOnDestroy(): void {
    // 保證組件銷毀時關閉 Dialog
    if (this.dynamicDialogRef) {
      this.dynamicDialogRef.close();
    }
  }

  formGroup!: FormGroup;

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      dataType: new FormControl(''),
      type: new FormControl(''),
      name: new FormControl(''),
      // value: new FormControl(''),
      // code: new FormControl(''),
      activeFlag: new FormControl(''),
    });

    // 取得 DataTypes 下拉資料
    this.optionService.getDataTypes().subscribe((res) => {
      this.dataTypes = res;
    });
    // 取得 activeFlag 下拉資料
    this.optionService.getSettingTypes(SettingType.YES_NO).subscribe((res) => {
      this.activeFlags = res;
    });

    this.cols = [
      { field: 'dataType', header: '配置種類' },
      { field: 'type', header: '類別' },
      { field: 'name', header: '名稱' },
      { field: 'code', header: '代碼' },
      { field: 'value', header: '值' },
      { field: 'description', header: '說明' },
      { field: 'priorityNo', header: '排序' },
    ];

    this.query();
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
    let formData = this.formGroup.value;
    console.log(formData);
    this.settingService
      .query(
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
}
