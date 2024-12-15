import { Routes } from '@angular/router';
import { RolesComponent } from './pages/roles/roles.component';
import { RoleFunctionsComponent } from './pages/role-functions/role-functions.component';

/**
 * 定義 Roles 子路由配置的檔案
 */
export const routes: Routes = [
  {
    path: '',
    component: RolesComponent,
  },
  {
    path: 'functions',
    component: RoleFunctionsComponent,
  },
];
