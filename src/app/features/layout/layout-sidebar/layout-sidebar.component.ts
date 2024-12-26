import {
  AfterContentChecked,
  Component,
  DoCheck,
  HostListener,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../services/layout.service';
import { WindowRefService } from '../services/window-ref.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Router } from '@angular/router';

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

  sidebarVisible: boolean = true; // 預設開啟

  constructor(public layoutService: LayoutService, private router: Router) {}

  ngOnInit(): void {
    // 初始化 側邊的超連結
    this.layoutService
      .getPermissions()
      .pipe(takeUntil(this._destroying$))
      .subscribe((res) => {
        this.items = res;
      });
  }

  ngOnDestroy() {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
