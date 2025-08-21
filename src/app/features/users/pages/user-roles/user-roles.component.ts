import { Component, OnInit } from '@angular/core';
import { BasePickListCompoent } from '../../../../shared/component/base/base-pickList.component';
import { CoreModule } from '../../../../core/core.module';
import { SharedModule } from '../../../../shared/shared.module';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { UsersService } from '../../services/users.service';
import { finalize } from 'rxjs/internal/operators/finalize';
import { UserRolesService } from '../../services/user-roles.service';
import { UpdateUserRoles } from '../../models/update-user-roles-request.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [SystemMessageService],
  templateUrl: './user-roles.component.html',
  styleUrl: './user-roles.component.scss',
})
export class UserRolesComponent extends BasePickListCompoent implements OnInit {
  username: string = '';
  service: string = '';

  constructor(
    private location: Location,
    private loadMaskService: LoadingMaskService,
    private userRolesService: UserRolesService,
    private userRoleService: UserRolesService,
    private dialogConfig: DynamicDialogConfig,
    private messageService: SystemMessageService,
    public ref: DynamicDialogRef
  ) {
    super();
  }

  ngOnInit(): void {
    console.log(this.dialogConfig.data);
    this.username = this.dialogConfig.data.data.username;
    this.service = this.dialogConfig.data.service;
    console.log(this.service);

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
  }

  /**
   * 查詢其他角色資料(不屬於該使用者的)
   */
  queryOthers() {
    let data = this.dialogConfig.data.data;
    this.userRoleService
      .queryOthers(data.username, this.service)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (res) => {
          if (res) {
            console.log(res);
            this.sourceList = res.map((role: any) => ({
              id: role.id,
              code: role.code,
              name: role.name,
              displayName: `${role.code} (${role.name})`, // 生成 displayName
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
   * 查詢該使用者角色資料
   */
  query() {
    let data = this.dialogConfig.data.data;

    this.userRolesService
      .queryRoles(data.username, this.service)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
        })
      )
      .subscribe((res) => {
        console.log(res);
        if (res) {
          this.targetList = res.map((role: any) => ({
            id: role.id,
            code: role.code,
            name: role.name,
            displayName: `${role.code} (${role.name})`, // 生成 displayName
          }));
        }
      });
  }

  /**
   * 提交資料，變更角色相關資料
   */
  onSubmit() {
    let roleIds = this.targetList
      ? this.targetList
          .map((e) => e.id)
          .filter((id): id is number => id !== undefined) // 過濾 undefined 值
      : [];

    let requestData: UpdateUserRoles = {
      username: this.username,
      service: this.service,
      roleIds: roleIds,
    };

    this.submitted = true;
    this.loadMaskService.show();
    this.userRoleService
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
}
