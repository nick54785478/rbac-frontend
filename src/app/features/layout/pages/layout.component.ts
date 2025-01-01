import {
  Component,
  DoCheck,
  HostListener,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { LayoutTopbarComponent } from '../layout-topbar/layout-topbar.component';
import { LayoutSidebarComponent } from '../layout-sidebar/layout-sidebar.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';
import { StorageService } from '../../../core/services/storage.service';
import { LayoutService } from '../services/layout.service';
import { SystemStorageKey } from '../../../core/enums/system-storage.enum';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-layout',
  standalone: true,
  // 因 LayoutComponent 為 standalone ，所以需引入 RouterModule，否則 html 內的 <router-outlet></router-outlet> 會報錯
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    LayoutTopbarComponent,
    LayoutSidebarComponent,
  ],
  providers: [],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  sidebarVisible: boolean = true; // 預設開啟

  username!: string | null;

  permissions: string[] = []; // 根據權限決定左側邊框能看到什麼頁面

  constructor(
    private layoutService: LayoutService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {}

  /**
   * 更新 Sidebar 的顯示狀態
   * */
  onChangeSidebarVisible(visible: boolean) {
    this.sidebarVisible = visible;
  }
}
