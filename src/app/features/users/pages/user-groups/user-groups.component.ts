import { Component, OnInit } from '@angular/core';
import { BasePickListCompoent } from '../../../../shared/component/base/base-pickList.component';
import { CoreModule } from '../../../../core/core.module';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { SharedModule } from '../../../../shared/shared.module';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserGroupsService } from '../../services/user-groups.service';
import { finalize } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { UpdateUserGroups } from '../../models/update-user-groups-request.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-group',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [UserGroupsService, SystemMessageService], // 註.不能注入 LoadingMaskService 否則會導致失效
  templateUrl: './user-groups.component.html',
  styleUrl: './user-groups.component.scss',
})
export class UserGroupsComponent
  extends BasePickListCompoent
  implements OnInit
{
  username: string = '';

  constructor(
    private location: Location,
    private userGroupService: UserGroupsService,
    private loadMaskService: LoadingMaskService,
    private userService: UsersService,
    private dialogConfig: DynamicDialogConfig,
    private messageService: SystemMessageService,
    public ref: DynamicDialogRef
  ) {
    super();
  }

  ngOnInit(): void {
    console.log(this.dialogConfig.data);
    this.username = this.dialogConfig.data.data.username;

    // 取得其他群組資料(不屬於該使用者的)
    this.queryOthers();
    // 取得該使用者的群組資料
    this.query();

    this.detailTabs = [
      {
        label: '提交',
        icon: 'pi pi-save',
        command: () => {
          this.onSubmit();
        },
        disabled: false,
      },
      {
        label: '取消',
        icon: 'pi pi-times',
        command: () => {
          this.cancel();
        },
        disabled: false,
      },
    ];

    // 監聽上一頁切換，關閉 Dialog
    this.location.onUrlChange(() => {
      this.onCloseForm();
    });
  }

  /**
   * 提交資料，變更角色相關資料
   */
  onSubmit() {
    let groupIds = this.targetList
      ? this.targetList
          .map((e) => e.id)
          .filter((id): id is number => id !== undefined) // 過濾 undefined 值
      : [];

    let requestData: UpdateUserGroups = {
      username: this.username,
      groupIds: groupIds,
    };

    this.submitted = true;
    this.loadMaskService.show();
    this.userGroupService
      .update(requestData)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
          this.query();
          this.queryOthers();
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
    this.sourceList = [];
    this.targetList = [];
    this.onCloseForm();
  }

  /**
   * 關閉 Dialog
   */
  onCloseForm() {
    console.log('關閉 Dialog');
    this.ref.close();
    // this.clear();
  }

  /**
   * 查詢其他群組資料(不屬於該使用者的)
   */
  queryOthers() {
    let data = this.dialogConfig.data.data;
    console.log(data);

    this.userGroupService
      .queryOthers(data.username)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (res) => {
          if (res) {
            console.log(res);
            this.sourceList = res.map((group: any) => ({
              id: group.id,
              code: group.code,
              name: group.name,
              displayName: `${group.code} (${group.name})`, // 生成 displayName
            }));
          }
          this.messageService.success('查詢成功');
        },
        error: (error) => {
          this.messageService.error(error.message);
        },
      });
  }

  /**
   * 查詢該使用者群組資料
   */
  query() {
    let data = this.dialogConfig.data.data;

    this.userService
      .queryGroups(data.username)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
        })
      )
      .subscribe((res) => {
        console.log(res);
        if (res) {
          this.targetList = res.map((group: any) => ({
            id: group.id,
            code: group.code,
            name: group.name,
            displayName: `${group.code} (${group.name})`, // 生成 displayName
          }));
        }
      });
  }
}
