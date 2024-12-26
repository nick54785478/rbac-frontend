import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

/**
 * 定義 Features 子路由配置的檔案
 */
export const routes: Routes = [
  // 預設路徑顯示 HomeComponent
  {
    path: '',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },

  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },

  {
    path: 'users',
    loadChildren: () =>
      import('./users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'roles',
    loadChildren: () =>
      import('./roles/roles.module').then((m) => m.RolesModule),
  },
  {
    path: 'functions',
    loadChildren: () =>
      import('./functions/functions.module').then((m) => m.FunctionsModule),
  },
  {
    path: 'groups',
    loadChildren: () =>
      import('./groups/groups.module').then((m) => m.GroupsModule),
  },
  {
    path: 'setting',
    loadChildren: () =>
      import('./setting/setting.module').then((m) => m.SettingModule),
  },
];
