import { Routes } from '@angular/router';
import { UsersComponent } from './pages/users/users.component';
import { RegisterComponent } from './pages/register/register.component';
import { PersonalityComponent } from './pages/personality/personality.component';

/**
 * 定義 Users 子路由配置的檔案
 */
export const routes: Routes = [
  // 預設路徑顯示 UsersComponent
  {
    path: '',
    component: UsersComponent,
  },
  // register 導向 註冊頁面
  {
    path: 'register',
    component: RegisterComponent,
  },
  // personality 導向個人頁面
  {
    path: 'personality',
    component: PersonalityComponent,
  },
];
