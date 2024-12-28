import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { StorageService } from '../services/storage.service';
import { SystemStorageKey } from '../enums/system-storage.enum';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private isAuthenticated: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {}

  /**
   * 實作 canActivate
   * @param route
   * @param state
   * @returns
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // 確認是否已登入
    this.authService
      .getJwtToken()
      .pipe(
        tap((token) => {
          if (!token) {
            // 如果沒有 Token，可以進行登出或重新導向邏輯
            console.log('未取得 Token，進入重導向頁面');
            // 設置重導向路徑為 login 登入頁面
            this.storageService.setSessionStorageItem(
              SystemStorageKey.REDIRECT_URL,
              '/login'
            );
            this.router.navigateByUrl('/redirect');
          }
        })
      )
      .subscribe((res) => {
        // 有 Token 放行
        this.isAuthenticated = true;
      });
    // this.router.navigateByUrl('/login');
    return this.isAuthenticated;
  }
}
