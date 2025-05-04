import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { LoginService } from '../../features/layout/services/login.service';
import { StorageService } from '../services/storage.service';
import { SystemStorageKey } from '../enums/system-storage.enum';

/**
 * JWT 攔截器
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);

  console.log('攔截請求' + req.url);

  // 如果是 refreshToken API，直接放行請求
  if (req.url.includes('/api/v1/refresh')) {
    console.log('refreshToken API，直接放行請求');
    return next(req);
  }

  return authService.getJwtToken().pipe(
    // 展平處理非同步流，確保非同步取得的 token 可以被處理，並用於後續請求的加工。
    switchMap((token) => {
      // 若 Token 過期，執行 refresh token
      if (
        authService.checkExpired(token) &&
        storageService.getLocalStorageItem(SystemStorageKey.REFRESH_TOKEN)
      ) {
        console.log('Token 過期，透過 refreshToken 更新既有的 Token');
        const refreshToken = storageService.getLocalStorageItem(
          SystemStorageKey.REFRESH_TOKEN
        );
        console.log(refreshToken);

        if (refreshToken) {
          authService.refreshToken(refreshToken).subscribe({
            next: (res) => {
              console.log('刷新 Token 成功!');
              storageService.setLocalStorageItem(
                SystemStorageKey.JWT_TOKEN,
                res?.token
              );
              storageService.setSessionStorageItem(
                SystemStorageKey.JWT_TOKEN,
                res?.token
              );
              storageService.setLocalStorageItem(
                SystemStorageKey.REFRESH_TOKEN,
                res?.refreshToken
              );
              storageService.setSessionStorageItem(
                SystemStorageKey.REFRESH_TOKEN,
                res?.refreshToken
              );
            },
            error: (err) => {
              console.log(err);
            },
          });
        }
      }

      // 如果有 Token，將其附加到 Header
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // 繼續處理請求
      return next(req).pipe(
        catchError((error) => {
          if (error.status === 500) {
            console.error('伺服器錯誤:', error.message);
            // 根據需要通知用戶
          } else {
            console.error('其他錯誤:', error.message);
          }

          // 返回 EMPTY 或重新導向
          return EMPTY;
        })
      );
    })
  );
};

// (res) => {
//   console.log('刷新 Token 成功!');
//   storageService.setLocalStorageItem(SystemStorageKey.JWT_TOKEN, res?.token);
//   storageService.setSessionStorageItem(SystemStorageKey.JWT_TOKEN, res?.token);
// };
