import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/layout/login/login.component';
import { NotFoundComponent } from './features/layout/not-found/not-found.component';
import { AccessDeniedComponent } from './features/layout/access-denied/access-denied.component';
import { ErrorComponent } from './features/layout/error/error.component';
import { LayoutComponent } from './features/layout/pages/layout.component';
import { RegisterComponent } from './features/users/pages/register/register.component';

/**
 * 定義根路由配置的檔案
 */
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // 使用 Layout 作為主版面
    // canActivate: [AuthGuard], // 要透過 AuthGuard 驗證過後才能進入
    children: [
      // 子頁面
      {
        path: '',
        loadChildren: () =>
          import('./features/features.module').then((m) => m.FeaturesModule),
      },
    ],
  },
  // 預設 '' 重導向到 /features
  { path: '', redirectTo: '/features', pathMatch: 'full' },

  // 登入頁面
  {
    path: 'login',
    component: LoginComponent,
  },

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
