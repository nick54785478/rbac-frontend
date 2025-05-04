import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CoreModule } from '../../core.module';
import { SharedModule } from '../../../shared/shared.module';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { SystemStorageKey } from '../../enums/system-storage.enum';
import { Subject } from 'rxjs/internal/Subject';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-redirect',
  standalone: true,
  imports: [SharedModule, CoreModule],
  templateUrl: './redirect.component.html',
  styleUrl: './redirect.component.scss',
  providers: [],
})
export class RedirectComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  ngOnInit(): void {
    // 若有 Token 但 Token 突然過期，進行刷新
    this.refreshToken();
    this.redirect();
  }

  ngAfterViewInit(): void {
    // this.redirect();
  }

  /**
   * 重導向
   */
  redirect() {
    // 把網址導到原本進入時的網址 ( 在 AuthGuard 寫入 sessionStorage 的 )
    const redirectUrl = this.storageService.getSessionStorageItem(
      SystemStorageKey.REDIRECT_URL
    )
      ? this.storageService.getSessionStorageItem(SystemStorageKey.REDIRECT_URL)
      : '/redirect';
    // 若此處不選擇 redirect 會導致重新整理時一瞬間出現該選擇頁面

    console.log(redirectUrl);

    // 取得 query params
    const queryParams = this.storageService.getSessionStorageItem(
      SystemStorageKey.QUERY_PARAMS
    );
    if (queryParams) {
      // 有取得使用該 param 導向
      this.router.navigate([redirectUrl], {
        queryParams: JSON.parse(queryParams),
      });
    } else {
      // 未取得則不帶 params
      console.log(redirectUrl);
      this.router.navigate([redirectUrl]);
    }
  }

  /**
   * 刷新 Token
   */
  refreshToken() {
    const token =
      this.storageService.getLocalStorageItem(SystemStorageKey.JWT_TOKEN) ||
      this.storageService.getSessionStorageItem(SystemStorageKey.JWT_TOKEN);

    // 有 Token 且 Token 過期
    if (token && this.authService.checkExpired(token)) {
      const refreshToken = this.storageService.getLocalStorageItem(
        SystemStorageKey.REFRESH_TOKEN
      );
      if (refreshToken) {
        this.authService.refreshToken(refreshToken).subscribe({
          next: (res) => {
            this.storageService.setLocalStorageItem(
              SystemStorageKey.JWT_TOKEN,
              res.token
            );
            this.storageService.setSessionStorageItem(
              SystemStorageKey.JWT_TOKEN,
              res.token
            );
            this.storageService.setLocalStorageItem(
              SystemStorageKey.REFRESH_TOKEN,
              res.refreshToken
            );
            this.storageService.setSessionStorageItem(
              SystemStorageKey.REFRESH_TOKEN,
              res.refreshToken
            );
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    }
  }
}
