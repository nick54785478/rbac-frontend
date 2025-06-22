import { Component, OnInit } from '@angular/core';
import { BasePickListCompoent } from '../../../../../shared/component/base/base-pickList.component';
import { RoleFunctionsService } from '../../../../roles/services/role-functions.service';
import { RoleService } from '../../../../roles/services/role.service';
import { SystemMessageService } from '../../../../../core/services/system-message.service';
import { CommonService } from '../../../../../shared/services/common.service';
import { SharedModule } from '../../../../../shared/shared.module';
import { CoreModule } from '../../../../../core/core.module';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LoadingMaskService } from '../../../../../core/services/loading-mask.service';
import { OptionService } from '../../../../../shared/services/option.service';
import { UpdateGroupRoles } from '../../../models/update-group-roles-request.model';
import { finalize } from 'rxjs/internal/operators/finalize';
import { GroupRolesService } from '../../../services/group-roles.service';
import { GroupsService } from '../../../services/groups.service';

@Component({
  selector: 'app-roles-config',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [CommonService, SystemMessageService],
  templateUrl: './roles-config.component.html',
  styleUrl: './roles-config.component.scss',
})
export class RolesConfigComponent
  extends BasePickListCompoent
  implements OnInit
{
  constructor(
    private dialogConfig: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private groupRolesService: GroupRolesService,
    private groupService: GroupsService,
    private loadMaskService: LoadingMaskService,
    private messageService: SystemMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    let data = this.dialogConfig.data;

    console.log(data.id);

    this.getOtherRoles(data.id, data.service);
    this.query(data.id, data.service);

    this.detailTabs = [
      {
        label: '提交',
        icon: 'pi pi-save',
        command: () => {
          this.onSubmit(data.id);
        },
        disabled: false,
      },
      {
        label: '取消',
        icon: 'pi pi-times',
        command: () => {
          this.onCloseForm();
        },
        disabled: false,
      },
    ];
  }

  /**
   * 提交變更角色群組資料
   * @param id
   */
  onSubmit(id: number) {
    let roleIds = this.targetList
      ? this.targetList
          .map((e) => e.id)
          .filter((id): id is number => id !== undefined) // 過濾 undefined 值
      : [];
    let requestData: UpdateGroupRoles = {
      groupId: id,
      roleIds: roleIds,
    };
    this.submitted = true;
    this.loadMaskService.show();
    this.groupRolesService
      .update(requestData)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
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
   * 關閉 Dialog
   */
  onCloseForm() {
    console.log('關閉 Dialog');
    this.ref.close();
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

  /**
   * 提交資料，查詢角色相關資料
   */
  query(id: number, service: string) {
    this.loadMaskService.show();

    this.groupRolesService
      .queryRoles(id, service)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
        })
      )
      .subscribe((res) => {
        let roleList = res;
        if (roleList) {
          this.targetList = roleList.map((role: any) => ({
            id: role.id,
            code: role.code,
            name: role.name,
            displayName: `${role.code} (${role.name})`, // 生成 displayName
          }));
        }
      });
  }
}
