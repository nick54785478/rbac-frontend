import {
  AfterContentChecked,
  Component,
  DoCheck,
  HostListener,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../services/layout.service';
import { WindowRefService } from '../services/window-ref.service';

@Component({
  selector: 'app-layout-sidebar',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './layout-sidebar.component.html',
  styleUrl: './layout-sidebar.component.scss',
  providers: [LayoutService],
})
export class LayoutSidebarComponent implements OnInit {
  items: MenuItem[] = [];

  sidebarVisible: boolean = true; // 預設開啟

  constructor(public layoutService: LayoutService) {}

  ngOnInit(): void {
    // 初始化 側邊的超連結
    this.layoutService.getPermissions().subscribe((res) => {
      this.items = res;
    });
  }
}
