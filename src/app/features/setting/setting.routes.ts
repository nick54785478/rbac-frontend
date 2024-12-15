import { Routes } from '@angular/router';
import { SettingComponent } from './pages/setting/setting.component';

/**
 * 定義 Users 子路由配置的檔案
 */
export const routes: Routes = [
  // 預設路徑顯示 SettingComponent
  {
    path: '',
    component: SettingComponent,
  },
];
