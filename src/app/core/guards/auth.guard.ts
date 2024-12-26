import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Route,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { StorageService } from '../services/storage.service';
import { SystemStorageKey } from '../enums/system-storage.enum';
import { NavigateService } from '../services/navigate.service';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/internal/operators/map';

// export const AuthGuard: CanActivateFn = (route, state) => {
//   // 注入 AuthService 和 Router
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // 嘗試從 LocalStorage 取 Token
//   const token = authService.getJwtToken();

//   // 確認是否已登入
//   if (authService.checkLoggedIn(token) && !authService.checkExpired(token)) {
//     return true;
//   } else {
//     // 若未登入，重定向到登錄頁
//     router.navigate(['/login']);
//     return false;
//   }
// };

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
