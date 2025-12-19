import { Component, OnInit } from '@angular/core';
import { BasePickListCompoent } from '../../../../../shared/component/base/base-pickList.component';
import { SystemMessageService } from '../../../../../core/services/system-message.service';
import { CoreModule } from '../../../../../core/core.module';
import { SharedModule } from '../../../../../shared/shared.module';
import { CommonService } from '../../../../../shared/services/common.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoleFunctionsService } from '../../../services/role-functions.service';
import { finalize } from 'rxjs/internal/operators/finalize';
import { RoleService } from '../../../services/role.service';
import { LoadingMaskService } from '../../../../../core/services/loading-mask.service';
import { UpdateRoleFunction } from '../../../models/update-role-function-request.model copy';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-functions-config',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [CommonService, SystemMessageService],
  templateUrl: './functions-config.component.html',
  styleUrl: './functions-config.component.scss',
})
export class FunctionsConfigComponent
  extends BasePickListCompoent
  implements OnInit
{
  constructor(
    private dialogConfig: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private roleFunctionsService: RoleFunctionsService,
    private roleService: RoleService,
    private loadMaskService: LoadingMaskService,
    private messageService: SystemMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    let data = this.dialogConfig.data;
    console.log(data.id);
    this.formGroup = new FormGroup({});

    this.getOtherFunctions(data.id, data.service);
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
   * 提交變更角色功能資料
   * @param id
   */
  onSubmit(id: number) {
    let funcIds = this.targetList
      ? this.targetList
          .map((e) => e.id)
          .filter((id): id is number => id !== undefined) // 過濾 undefined 值
      : [];
    let requestData: UpdateRoleFunction = {
      roleId: id,
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
        })
      )
      .subscribe({
        next: (res) => {
          if (res.code !== 'VALIDATION_FAILED') {
            this.messageService.success(res.message);
            this.onCloseForm();
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
   * 取得不屬於該角色的功能
   * @param id
   * @param service
   */
  getOtherFunctions(id: number, service: string) {
    this.submitted = true;
    if (this.formGroup.invalid) {
      return;
    }
    this.roleFunctionsService
      .getOtherFunctions(id, service)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.submitted = false;
        })
      )
      .subscribe((res) => {
        console.log(res);
        if (res) {
          this.sourceList = res.map((item: any) => ({
            id: item.id, // 保留 id
            service: item.service,
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

    this.submitted = true;
    if (!this.submitted || this.formGroup.invalid) {
      return;
    }

    this.roleService
      .queryByIdAndService(id, service)
      .pipe(
        finalize(() => {
          this.loadMaskService.hide();
          this.submitted = false;
        })
      )
      .subscribe((res) => {
        console.log(res);
        let funcList = res.functions;
        if (funcList) {
          this.targetList = funcList.map((func: any) => ({
            id: func.id,
            service: func.service,
            code: func.code,
            name: func.name,
            displayName: `${func.code} (${func.name})`, // 生成 displayName
          }));
        }
      });
  }
}
