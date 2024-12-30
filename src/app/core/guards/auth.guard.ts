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
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private isAuthenticated: boolean = false;

  private publicPaths: string[] = ['/login', '/', '/help', '/register']; // 公開路徑

  constructor(
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {}

  /**
   * 實作 canActivate
   *
   * @param route
   * @param state
   * @returns
   * canActivate 方法的返回值可以是以下幾種之一：
   * - boolean 若返回 true，允許導航到目標路由；返回 false，阻止導航。
   * - UrlTree 若返回一個 UrlTree，導航會被重定向到該 UrlTree 表示的路徑，常用於未通過授權檢查時，跳轉到登入頁或其他路徑。
   * - Observable<boolean | UrlTree> 可以返回一個 Observable，用於執行異步操作，例如從伺服器驗證用戶，結果為 true 或 UrlTree 時，決定是否導航。
   * - Promise<boolean | UrlTree> 用於處理異步操作，與 Observable 類似。
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const currentPath = state.url;

    // 如果當前路徑是公開路徑，直接放行
    if (this.publicPaths.includes(currentPath)) {
      console.log();
      return true;
    }

    // 確認是否已登入
    return this.authService.getJwtToken().pipe(
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
      }),
      // 檢查 Token 狀態，返回 true 或 UrlTree
      map((token) => {
        if (token && !this.authService.checkExpired(token)) {
          return true; // 放行
        } else {
          // 返回 UrlTree 進行重導向
          return this.router.createUrlTree(['/redirect']);
        }
      })
    );
    //   .subscribe((res) => {
    //     // 有 Token 放行
    //     this.isAuthenticated = true;
    //   });
    // // 返回 UrlTree 進行重導向
    // return this.router.createUrlTree(['/redirect']);
  }
}
