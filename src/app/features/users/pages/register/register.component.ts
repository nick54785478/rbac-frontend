import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { BaseFormCompoent } from '../../../../shared/component/base/base-form.component';
import { CoreModule } from '../../../../core/core.module';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { environment } from '../../../../../environments/environment';
import { RegisterUser } from '../../models/register-user-request.model';
import { finalize } from 'rxjs';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [SystemMessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent extends BaseFormCompoent implements OnInit {
  constructor(
    private systemMessageService: SystemMessageService,
    private loadMaskService: LoadingMaskService,
    private userService: UsersService
  ) {
    super();
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      birthday: new FormControl('', [Validators.required]),
      nationalId: new FormControl('', [Validators.required]),
      address: new FormControl(''),
    });
  }

  /**
   * 提交表單資料
   */
  onSubmit() {
    this.submitted = true;
    if (environment.apiMock) {
      this.systemMessageService.success('新增資料成功');
    } else {
      this.submitted = true;
      if (this.formGroup.valid) {
        this.loadMaskService.show();
        // 將表單資料設置進 CreateSetting
        const request: RegisterUser = { ...this.formGroup.value };
        this.userService
          .create(request)
          .pipe(
            finalize(() => {
              this.loadMaskService.hide();
              this.submitted = false;
            })
          )
          .subscribe({
            next: (res) => {
              if (res.code === 'VALIDATION_FAILED') {
                this.systemMessageService.error(res?.message);
                location.reload;
              } else {
                this.systemMessageService.success(res?.message);
              }
            },
            error: (error) => {
              this.systemMessageService.error(error.message);
            },
          });
      }
    }
  }

  clear() {}

  onCloseForm() {}
}
