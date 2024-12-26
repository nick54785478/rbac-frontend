import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CoreModule } from '../../../core/core.module';
import { BaseFormCompoent } from '../../../shared/component/base/base-form.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { url } from 'inspector';
import { JwtToken } from '../models/jwt-token.model';
import { Observable } from 'rxjs/internal/Observable';
import { LoginService } from '../services/login.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { LoadingMaskService } from '../../../core/services/loading-mask.service';
import { SystemMessageService } from '../../../core/services/system-message.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { SystemStorageKey } from '../../../core/enums/system-storage.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, CoreModule],
  providers: [
    SystemMessageService,
    LoadingMaskService,
    AuthService,
    StorageService,
    Router,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent
  extends BaseFormCompoent
  implements OnInit, OnDestroy
{
  private readonly _destroying$ = new Subject<void>();

  constructor(
    public router: Router,
    private loginService: LoginService,
    private authService: AuthService,
    private storageService: StorageService,
    private messageService: SystemMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  /**
   * 使用者登入
   * @returns
   */
  login() {
    // 登入前先清除
    this.authService.clearToken();

    this.submitted = true;

    if (!this.submitted || !this.formGroup.valid) {
      return;
    }

    let formData = this.formGroup.value;
    let request = { ...formData };
    this.loginService
      .login(request)
      .pipe(
        takeUntil(this._destroying$),
        finalize(() => {
          this.submitted = false;
        })
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          if (res?.code === 'VALIDATION_FAILED') {
            this.messageService.error(res.message);
          } else {
            this.messageService.success('使用者登入成功');

            // 先將 Token 清除，再設置進去
            this.storageService.removeSessionStorageItem(
              SystemStorageKey.JWT_TOKEN
            );

            // 設置 Token 進 SessionStorage
            this.storageService.setSessionStorageItem(
              SystemStorageKey.JWT_TOKEN,
              res.token
            );
            // 設置 Token 進 LocalStorage
            this.storageService.setLocalStorageItem(
              SystemStorageKey.JWT_TOKEN,
              res.token
            );

            this.authService.tokenSubject$.next(res.token);

            console.log('有取得已登入的結果');
            // 有取得已登入的結果，導向首頁
            this.router.navigateByUrl('/');
          }
        },
        error: (err) => {
          this.messageService.error(err.message);
        },
      });
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
