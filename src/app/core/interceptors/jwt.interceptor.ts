import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { LoginService } from '../../features/layout/services/login.service';
import { StorageService } from '../services/storage.service';
import { SystemStorageKey } from '../enums/system-storage.enum';

/**
 * JWT 攔截器
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);

  console.log('攔截請求')
 
  return authService.getJwtToken().pipe(
    tap((token) => {
      if (authService.checkExpired(token)) {
        console.log('Token 過期，透過 refreshToken 更新既有的 Token')
        const refreshToken = storageService.getLocalStorageItem(SystemStorageKey.REFRESH_TOKEN) || '';
        console.log(refreshToken);
        // // 當 Token 過期後，透過 refreshToken 到後端刷新 Token
        // authService.refreshToken(refreshToken).subscribe(res => {
        //   storageService.setLocalStorageItem(SystemStorageKey.JWT_TOKEN, res?.token);
        //   storageService.setSessionStorageItem(SystemStorageKey.JWT_TOKEN, res?.token);

        // });
      }
    }),
    // 展平處理非同步流，確保非同步取得的 token 可以被處理，並用於後續請求的加工。
    switchMap((token) => {
      

      console.log(authService.checkExpired(token))

      // 如果有 Token，將其附加到 Header
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // 繼續處理請求
      return next(req);
    })
  );

};
