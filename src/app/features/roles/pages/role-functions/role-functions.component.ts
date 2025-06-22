import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { Subject } from 'rxjs/internal/Subject';
import { CommonService } from '../../../../shared/services/common.service';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OptionService } from '../../../../shared/services/option.service';
import { RoleInfoOption } from '../../../../shared/models/role-info-option.model';
import { RoleService } from '../../services/role.service';
import { RoleFunctionsService } from '../../services/role-functions.service';
import { UpdateRoleFunction } from '../../models/update-role-function-request.model copy';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { RoleQueried } from '../../models/role-query.model';
import { BasePickListCompoent } from '../../../../shared/component/base/base-pickList.component';
import { SettingType } from '../../../../core/enums/setting-type.enum';
import { Option } from '../../../../shared/models/option.model';

@Component({
  selector: 'app-role-function',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [CommonService, SystemMessageService],
  templateUrl: './role-functions.component.html',
  styleUrl: './role-functions.component.scss',
})
export class RoleFunctionsComponent
  extends BasePickListCompoent
  implements OnInit, DoCheck, OnDestroy
{
  roleOptions: RoleInfoOption[] = [];

  // AutoComplete 與其下拉欄位值變動的 Subject，用來避免前次查詢較慢返回覆蓋後次資料
  private dataSubject$ = new Subject<string>();

  selected!: RoleQueried; // 被查詢的角色資料

  queriedStr!: string;

  serviceList: Option[] = []; // 服務清單

  roleReadonly = true; // 控制角色欄位是否可填

  /**
   * 用來取消訂閱
   */
  readonly _destroying$ = new Subject<void>();

  constructor(
    private roleFunctionsService: RoleFunctionsService,
    private optionService: OptionService,
    private loadMaskService: LoadingMaskService,
    private messageService: SystemMessageService
  ) {
    super();
  }
  ngDoCheck(): void {
    this.detailTabs = [
      {
        label: '提交',
        icon: 'pi pi-save',
        command: () => {
          this.onSubmit();
        },
        disabled: this.sourceList.length === 0 && this.targetList.length === 0,
      },
      {
        label: '取消',
        icon: 'pi pi-times',
        command: () => {
          this.cancel();
        },
        disabled: this.sourceList.length === 0 && this.targetList.length === 0,
      },
    ];
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      service: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
    });

    // role 會監聽 service 的值變化
    this.formGroup.get('service')?.valueChanges.subscribe((val) => {
      const roleControl = this.formGroup.get('role');
      if (!val) {
        this.roleReadonly = true;
        roleControl?.reset(); // 清空資料
      } else {
        this.roleReadonly = false;
      }
    });

    this.detailTabs = [
      {
        label: '提交',
        icon: 'pi pi-save',
        command: () => {
          this.onSubmit();
        },
        disabled: this.sourceList.length === 0 && this.targetList.length === 0,
      },
      {
        label: '取消',
        icon: 'pi pi-times',
        command: () => {
          this.cancel();
        },
        disabled: this.sourceList.length === 0 && this.targetList.length === 0,
      },
    ];

    this.optionService.getSettingTypes(SettingType.SERVICE).subscribe({
      next: (res) => {
        this.serviceList = res;
      },
      error: (error) => {
        this.messageService.error('取得資料發生錯誤', error.message);
      },
    });
  }

  ngOnDestroy(): void {
    this.dataSubject$.closed;
  }

  /**
   * 提交資料，變更角色相關資料
   */
  onSubmit() {
    let funcIds = this.targetList
      ? this.targetList
          .map((e) => e.id)
          .filter((id): id is number => id !== undefined) // 過濾 undefined 值
      : [];
    let roleId = this.formGroup.value.role.id;
    let service = this.formGroup.value.service;

    console.log(this.targetList);
    let requestData: UpdateRoleFunction = {
      roleId: roleId,
      service: service,
      functions: funcIds,
    };
    this.submitted = true;
    this.loadMaskService.show();
    this.roleFunctionsService
      .update(requestData)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
          this.query();
        })
      )
      .subscribe({
        next: (res) => {
          if (res.code !== 'VALIDATION_FAILED') {
            this.messageService.success(res.message);
          } else {
            this.messageService.error(res.message);
          }
        },
        error: (error) => {
          this.messageService.error(error);
        },
      });
  }

  /**
   * 清空所有
   */
  cancel() {
    this.formGroup.reset();
    this.sourceList = [];
    this.targetList = [];
  }

  /**
   * 提交資料，查詢角色相關資料
   */
  query() {
    let formData = this.formGroup.value;
    this.submitted = true;
    if (!this.formGroup.valid || !this.submitted) {
      return;
    }

    this.loadMaskService.show();

    console.log(formData.role);
    this.roleFunctionsService
      .queryFuncs(formData.role.id, formData.service)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
        })
      )
      .subscribe((res) => {
        console.log(this.selected);
        let funcList = res;
        if (funcList) {
          this.targetList = funcList.map((func: any) => ({
            id: func.id,
            code: func.code,
            name: func.name,
            displayName: `${func.code} (${func.name})`, // 生成 displayName
          }));
        }
      });
    this.getOtherFunctions(formData.role.id, formData.service);
  }

  /**
   * 查詢角色下拉式選單
   * @param event
   */
  getRoleOptions(event: any) {
    if (event.query.length < 2 || event.query === this.queriedStr) {
      return;
    }
    this.queriedStr = event.query;

    if (!this.dataSubject$.observed) {
      // this.loadMaskService.show();
      // 初始化 AutoComplete 的訂閱
      this.dataSubject$
        .pipe(
          finalize(() => {
            // 無論成功或失敗都會執行
            // this.loadMaskService.hide();
          }),
          debounceTime(300), // 防抖，避免频繁發请求
          switchMap((keyword) => {
            console.log(keyword);
            let service = this.formGroup.value.service;

            return this.optionService.getRoleOptions(service, keyword);
          }), // 自動取消上一次未完成的請求

          takeUntil(this._destroying$)
        )
        .subscribe((res) => {
          console.log(res);
          this.roleOptions = res.map((item: any) => ({
            id: item.id, // 保留 id
            code: item.code, // 保留 name
            name: item.name, // 保留 nameEn
            displayName: `${item.code} (${item.name})`, // 生成 displayName
          }));
        });
    }
    this.dataSubject$.next(event.query);
  }

  /**
   * 取得不屬於該角色的功能
   * @param id
   * @param service
   */
  getOtherFunctions(id: number, service: string) {
    this.roleFunctionsService
      .queryOthers(id, service)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
        })
      )
      .subscribe((res) => {
        console.log(res);
        if (res) {
          this.sourceList = res.map((item: any) => ({
            id: item.id, // 保留 id
            code: item.code, // 保留 name
            name: item.name, // 保留 nameEn
            displayName: `${item.code} (${item.name})`, // 生成 displayName
          }));
        }
      });
  }
}
