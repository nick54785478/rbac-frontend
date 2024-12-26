import { Routes } from '@angular/router';
import { RedirectComponent } from './redirect.component';
import { LoginComponent } from '../../../features/layout/login/login.component';

/**
 * 定義 Redirect 子路由配置的檔案
 */
export const routes: Routes = [
  // 預設路徑顯示 RedirectComponent
  {
    path: '',
    component: RedirectComponent,
  },
  // 預設路徑顯示 RedirectComponent
  {
    path: 'login',
    component: LoginComponent,
  },
];
