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
import { GroupRolesService } from '../../services/group-roles.service';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { BasePickListCompoent } from '../../../../shared/component/base/base-pickList.component';
import { GroupsService } from '../../services/groups.service';
import { UpdateGroupRoles } from '../../models/update-group-roles-request.model';
import { GroupQueried } from '../../models/group-query.model';
import { GroupInfoOption } from '../../../../shared/models/group-info-option.model';
import { Option } from '../../../../shared/models/option.model';
import { SettingType } from '../../../../core/enums/setting-type.enum';
import { group } from 'node:console';

@Component({
  selector: 'app-group-roles',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [CommonService, SystemMessageService],
  templateUrl: './group-roles.component.html',
  styleUrl: './group-roles.component.scss',
})
export class GroupRolesComponent
  extends BasePickListCompoent
  implements OnInit, DoCheck, OnDestroy
{
  groupOptions: GroupInfoOption[] = [];
  services: Option[] = [];

  // AutoComplete 與其下拉欄位值變動的 Subject，用來避免前次查詢較慢返回覆蓋後次資料
  private dataSubject$ = new Subject<string>();

  selected!: GroupQueried; // 被查詢的角色資料

  queriedStr!: string;

  /**
   * 用來取消訂閱
   */
  readonly _destroying$ = new Subject<void>();

  constructor(
    private groupService: GroupsService,
    private groupRolesService: GroupRolesService,
    private optionService: OptionService,
    private messageService: SystemMessageService,
    private loadMaskService: LoadingMaskService
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
      group: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
    });

    // 監聽 service 變更
    this.formGroup.get('service')?.valueChanges.subscribe((serviceValue) => {
      const control = this.formGroup.get('group');
      if (serviceValue) {
        control?.enable(); // 選到 service -> 啟用 role
        this.formGroup.patchValue({
          group: '',
        });
        this.getGroupOptions(this.queriedStr, serviceValue);
        this.groupOptions = []; // 清空群組下拉選單
      } else {
        control?.reset(); // 清空角色
        control?.disable(); // 禁用 role
        // 清空查詢結果
        this.sourceList = [];
        this.targetList = [];
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
  }

  ngOnDestroy(): void {
    this.dataSubject$.closed;
  }

  /**
   * 提交資料，變更角色相關資料
   */
  onSubmit() {
    let groupId = this.formGroup.value.group.id;
    console.log(this.targetList);
    let roleIds = this.targetList
      ? this.targetList
          .map((e) => e.id)
          .filter((id): id is number => id !== undefined) // 過濾 undefined 值
      : [];

    let requestData: UpdateGroupRoles = {
      groupId: groupId,
      roleIds: roleIds,
    };
    console.log(requestData);
    this.submitted = true;
    this.loadMaskService.show();
    this.groupRolesService
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
   * 提交資料，查詢群組相關角色資料 (顯示於 PickList 左側)
   */
  query() {
    let formData = this.formGroup.value;
    this.submitted = true;
    if (!this.formGroup.valid || !this.submitted) {
      return;
    }

    this.loadMaskService.show();
    this.groupService
      .queryByIdAndService(formData.group.id, formData.service)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
        })
      )
      .subscribe((res) => {
        let roleList = res.roles;
        if (roleList) {
          this.targetList = roleList.map((role: any) => ({
            id: role.id,
            service: role.service,
            code: role.code,
            name: role.name,
            displayName: `${role.code} (${role.name})`, // 生成 displayName
          }));
          console.log(this.targetList);
        }
      });
    // 查詢不屬於該 群組 (id) 的角色資料
    this.getOtherRoles(formData.group.id, formData.service);
  }

  /**
   * 查詢群組下拉式選單
   * @param event
   */
  getGroupOptions(event: any, service: string) {
    if (event.query.length < 2 || event.query === this.queriedStr) {
      return;
    }
    // 查詢前先清空
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
          debounceTime(300), // 防抖，避免頻繁發請求
          switchMap((keyword) => {
            console.log(keyword);

            return this.optionService.getGroupOptions(service, keyword);
          }), // 自動取消上一次未完成的請求

          takeUntil(this._destroying$)
        )
        .subscribe((res) => {
          console.log(res);
          this.groupOptions = res.map((item: any) => ({
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
   * 取得不屬於該群組的角色
   * @param id
   */
  getOtherRoles(id: number, service: string) {
    this.groupRolesService
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
