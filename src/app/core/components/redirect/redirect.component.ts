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
import { NavigateService } from '../../services/navigate.service';
import { delay, startWith, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../../../features/layout/login/login.component';

@Component({
  selector: 'app-redirect',
  standalone: true,
  imports: [SharedModule, CoreModule],
  templateUrl: './redirect.component.html',
  styleUrl: './redirect.component.scss',
  providers: [Router],
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
    console.log('這是重導向頁面');
    // this.redirect();
  }

  ngAfterViewInit(): void {
    this.redirect();
  }

  /**
   * 檢查重導向方向
   */
  redirect() {
    this.authService.tokenSubject$
      .pipe(
        startWith(this.authService.tokenSubject$.getValue()),
        tap((token) => {
          if (!token) {
            // 如果沒有 Token，可以進行登出或重新導向邏輯
            console.log('未取得 Token，重導向到登入頁面');
            this.router.navigateByUrl('/login');
          }
        })
      )
      .subscribe((token) => {
        // 有 Token 的情況
        if (this.authService.isAuthenticated(token)) {
          // 把網址導到原本進入時的網址 ( 在 AuthGuard 寫入 sessionStorage 的 )
          const redirectUrl = this.storageService.getSessionStorageItem(
            SystemStorageKey.REDIRECT_URL
          )
            ? this.storageService.getSessionStorageItem(
                SystemStorageKey.REDIRECT_URL
              )
            : '/';
          const queryParams = this.storageService.getSessionStorageItem(
            SystemStorageKey.QUERY_PARAMS
          );
          if (queryParams) {
            this.router.navigate([redirectUrl], {
              queryParams: JSON.parse(queryParams),
            });
          } else {
            console.log(redirectUrl);
            this.router.navigate([redirectUrl]);
          }
        }
      });
  }
}
