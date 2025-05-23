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
    private systemMessageService: SystemMessageService,
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
      group: new FormControl('', [Validators.required]),
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
            this.systemMessageService.success(res.message);
          } else {
            this.systemMessageService.error(res.message);
          }
        },
        error: (error) => {
          this.systemMessageService.error(error);
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
      .queryById(formData.group.id)
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
            code: role.code,
            name: role.name,
            displayName: `${role.code} (${role.name})`, // 生成 displayName
          }));
          console.log(this.targetList);
        }
      });
    // 查詢不屬於該 群組 (id) 的角色資料
    this.getOtherRoles(formData.group.id);
  }

  /**
   * 查詢群組下拉式選單
   * @param event
   */
  getGroupOptions(event: any) {
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

            return this.optionService.getGroupOptions(keyword);
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
  getOtherRoles(id: number) {
    this.groupRolesService
      .queryOthers(id)
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
