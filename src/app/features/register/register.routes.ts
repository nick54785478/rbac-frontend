import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register.component';

/**
 * 定義 Roles 子路由配置的檔案
 */
export const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
  },
];
