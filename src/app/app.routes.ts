import { Routes } from '@angular/router';
import { LoginComponent } from './features/layout/login/login.component';
import { NotFoundComponent } from './features/layout/not-found/not-found.component';
import { AccessDeniedComponent } from './features/layout/access-denied/access-denied.component';
import { ErrorComponent } from './features/layout/error/error.component';
import { LayoutComponent } from './features/layout/pages/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

/**
 * 定義根路由配置的檔案
 */
export const routes: Routes = [
  // 登入頁面
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'redirect',
    loadChildren: () =>
      import('./core/components/redirect/redirect.module').then(
        (m) => m.RedirectModule
      ),
    // canActivate: [MsalGuard], // 要透過 MsalGuard 驗證過後才能進入
  },
  {
    path: '',
    component: LayoutComponent, // 使用 Layout 作為主版面
    children: [
      // 子頁面
      {
        path: '',
        loadChildren: () =>
          import('./features/features.module').then((m) => m.FeaturesModule),
      },
    ],
    // 目前先拿掉 登入，尚待完成
    canActivate: [AuthGuard], // 要透過 AuthGuard 驗證過後才能進入
  },
  // 預設 '' 重導向到 /features
  { path: '', redirectTo: '/features', pathMatch: 'full' },

  // Not Found
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  // Access Denied
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },

  // Error
  {
    path: 'error',
    component: ErrorComponent,
  },
  // 通配符路由
  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full',
  },
];
