import { Routes } from '@angular/router';
import { BooksComponent } from './pages/books.component';
import { PersonalRoleBookComponent } from './pages/personal-role-book/personal-role-book.component';
import { GroupRoleBookComponent } from './pages/group-role-book/group-role-book.component';

/**
 * 定義 Users 子路由配置的檔案
 */
export const routes: Routes = [
  // 預設路徑顯示 UsersComponent
  {
    path: '',
    component: BooksComponent,
  },
  {
    path: 'personal',
    component: PersonalRoleBookComponent,
  },
  {
    path: 'group',
    component: GroupRoleBookComponent,
  },
];
