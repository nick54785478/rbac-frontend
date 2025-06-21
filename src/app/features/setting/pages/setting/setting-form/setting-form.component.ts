import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Option } from '../../../../../shared/models/option.model';
import { CreateSetting } from '../../../models/create-setting-request.model';
import { environment } from '../../../../../../environments/environment';
import { SettingService } from '../../../service/setting.service';
import { CoreModule } from '../../../../../core/core.module';
import { SystemMessageService } from '../../../../../core/services/system-message.service';
import { OptionService } from '../../../../../shared/services/option.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BaseFormCompoent } from '../../../../../shared/component/base/base-form.component';
import { finalize, forkJoin } from 'rxjs';
import { SettingQueried } from '../../../models/setting-query.model';
import { UpdateSetting } from '../../../models/update-setting-request.model';
import { SettingType } from '../../../../../core/enums/setting-type.enum';
import { Location } from '@angular/common';
import { error } from 'console';

@Component({
  selector: 'app-setting-form',
  standalone: true,
  imports: [SharedModule, CoreModule],
  templateUrl: './setting-form.component.html',
  styleUrl: './setting-form.component.scss',
})
export class SettingFormComponent
  extends BaseFormCompoent
  implements OnInit, OnDestroy
{
  dataTypes: Option[] = [];
  activeFlags: Option[] = [];
  serviceList: Option[] = []; // 服務清單

  constructor(
    private location: Location,
    private dialogConfig: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private settingService: SettingService,
    private optionService: OptionService,
    private systemMessageService: SystemMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    // 監聽上一頁切換，關閉 Dialog
    this.location.onUrlChange(() => {
      this.onCloseForm();
    });

    this.formAction = this.dialogConfig.data['action'];
    this.formGroup = new FormGroup({
      serviceName: new FormControl('', [Validators.required]),
      dataType: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      priorityNo: new FormControl(''),
      activeFlag: new FormControl(''),
    });

    // 取得下拉式選單資料
    forkJoin({
      dataTypes: this.optionService.getDataTypes(),
      activeFlags: this.optionService.getSettingTypes(SettingType.YES_NO),
      serviceList: this.optionService.getSettingTypes(SettingType.SERVICE),
    }).subscribe(({ dataTypes, activeFlags, serviceList }) => {
      this.dataTypes = dataTypes;
      this.activeFlags = activeFlags;
      this.serviceList = serviceList;

      // 編輯資料表單要 Patch
      if (this.formAction === 'edit') {
        this.patchFormGroupValue(this.dialogConfig.data['data']);
      }
    });
  }

  ngOnDestroy() {}

  /**
   * 資料提交
   */
  onSubmit(): void {
    console.log(this.formGroup.value);

    // 測試用
    if (environment.apiMock) {
      this.systemMessageService.success('新增資料成功');
    } else {
      this.submitted = true;
      if (!this.formGroup.valid || !this.submitted) {
        return;
      }

      // 透過 FormAction 判斷'新增'或'編輯'
      if (this.formAction === 'add') {
        this.onAddSetting();
      } else {
        this.onUpdateSetting();
      }
    }
  }

  /**
   * 新增一筆資料
   */
  onAddSetting() {
    // 將表單資料設置進 CreateSetting
    const request: CreateSetting = { ...this.formGroup.value };
    console.log(request);
    this.settingService
      .create(request)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.clear();
          // this.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.systemMessageService.success('新增資料成功');
          this.onCloseForm();
        },
        error: (error) => {
          this.systemMessageService.error(error.message);
          // this.onCloseForm();
        },
      });
  }

  /**
   * 修改設定資料
   */
  onUpdateSetting() {
    const request: UpdateSetting = { ...this.formGroup.value };
    console.log(request);
    let id = this.dialogConfig.data['data'].id;

    this.submitted = true;
    if (this.formGroup.invalid || !this.submitted) {
      return;
    }
    this.settingService
      .update(id, request)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.clear();
          this.submitted = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.systemMessageService.success(res.message);
          this.onCloseForm();
        },
        error: (error) => {
          this.systemMessageService.error(error.message);
          // this.onCloseForm();
        },
      });
  }

  /**
   * 關閉 Dialog
   */
  onCloseForm() {
    console.log('關閉 Dialog');
    this.ref.close();
    this.clear();
  }

  /**
   * 清除表單資料
   */
  clear() {
    this.formGroup.reset();
  }

  /**
   * 要編輯時，設值進Form表單
   * @param data
   */
  override patchFormGroupValue(data: SettingQueried): void {
    this.formGroup.patchValue({
      serviceName: data.service,
      dataType: data.dataType,
      type: data.type,
      name: data.name,
      description: data.description,
      priorityNo: data.priorityNo,
      activeFlag: data.activeFlag,
    });
  }
}
