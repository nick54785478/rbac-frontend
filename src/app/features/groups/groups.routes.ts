import { Routes } from '@angular/router';
import { GroupsComponent } from './pages/groups/groups.component';
import { GroupRolesComponent } from './pages/group-roles/group-roles.component';

/**
 * 定義 Users 子路由配置的檔案
 */
export const routes: Routes = [
  // 預設路徑顯示 UsersComponent
  {
    path: '',
    component: GroupsComponent,
  },
  {
    path: 'roles',
    component: GroupRolesComponent,
  },
];
