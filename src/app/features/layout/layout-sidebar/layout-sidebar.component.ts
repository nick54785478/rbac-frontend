import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../services/layout.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Router } from '@angular/router';
import { firstValueFrom, lastValueFrom, map, of } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { SystemStorageKey } from '../../../core/enums/system-storage.enum';

@Component({
  selector: 'app-layout-sidebar',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './layout-sidebar.component.html',
  styleUrl: './layout-sidebar.component.scss',
  providers: [LayoutService, Router],
})
export class LayoutSidebarComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();

  items: MenuItem[] = [];

  permissions: string[] = ['HOME', 'REGISTER']; // 權限清單

  sidebarVisible: boolean = true; // 預設開啟

  constructor(
    public layoutService: LayoutService,
    private storageService: StorageService,
    private router: Router
  ) {}

  async ngOnInit() {
    let username = await firstValueFrom(
      of(
        this.storageService.getSessionStorageItem(SystemStorageKey.USERNAME) ||
          this.storageService.getLocalStorageItem(SystemStorageKey.USERNAME) ||
          ''
      )
    );

    this.items = await lastValueFrom(this.layoutService.getPermissions());

    // 透過該帳號取得其能看到的頁面超連結
    this.permissions = await firstValueFrom(
      this.layoutService
        .getMaintainPermissions(username)
        .pipe(map((res) => res.permissionList))
    );
    console.log(this.permissions);

    // 放置進 SessionStorage 供其他頁面取用
    this.storageService.setPermissionList(this.permissions);

    // 初始化 側邊的超連結
    console.log(this.items);

    this.items = await lastValueFrom(
      this.layoutService.getPermissions().pipe(
        map((res) => {
          console.log(res);
          res.forEach((item) => {
            let id = item.id ? item.id : '';
            if (this.permissions.includes(id)) {
              // 更改為 visible (顯示)
              item.visible = true;
            }
          });
          return res;
        }),
        takeUntil(this._destroying$)
      )
    );
  }

  ngOnDestroy() {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
