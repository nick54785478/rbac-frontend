import { Routes } from '@angular/router';
import { UsersComponent } from './pages/users/users.component';
import { RegisterComponent } from './pages/register/register.component';

/**
 * 定義 Users 子路由配置的檔案
 */
export const routes: Routes = [
  // 預設路徑顯示 UsersComponent
  {
    path: '',
    component: UsersComponent,
  },
  // 預設路徑顯示 UsersComponent
  {
    path: 'register',
    component: RegisterComponent,
  },
];
