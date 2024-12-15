import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

/**
 * 定義子路由配置的檔案
 */
export const routes: Routes = [
  // 預設路徑顯示 HomeComponent
  {
    path: '',
    component: HomeComponent,
  },
];
