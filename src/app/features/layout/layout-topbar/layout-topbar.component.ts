import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { LayoutService } from '../services/layout.service';
import { WindowRefService } from '../services/window-ref.service';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { OptionService } from '../../../shared/services/option.service';
import { SettingType } from '../../../core/enums/setting-type.enum';
import { MenuItem, PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-layout-topbar',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './layout-topbar.component.html',
  styleUrl: './layout-topbar.component.scss',
  providers: [LayoutService],
})
export class LayoutTopbarComponent implements OnInit {
  @Output() visibleEmit = new EventEmitter<boolean>();

  @ViewChild('tLanguageMenu') tLanguageMenu!: Menu; // 語系切換，目前尚未實作
  isLanguageMenuOpen: boolean = false; // 語系選單顯示Flag
  languages: MenuItem[] = []; // 語系選單

  sidebarVisible: boolean = false; // 本地變數，監聽 SideBar 狀態

  constructor(
    private windowRef: WindowRefService,
    private router: Router,
    private optionService: OptionService,
    private primengConfig: PrimeNGConfig
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;

    const win = this.windowRef.nativeWindow;
    if (win) {
      this.checkScreenSize();
    }

    this.languages = [
      {
        items: [
          {
            label: 'en',
            value: 'en',
          },
          {
            label: 'zh_tw',
            value: 'zh_tw',
          },
          {
            label: 'zh_ch',
            value: 'zh_ch',
          },
        ],
      },
    ];
  }

  /**
   * 開關 Side Bar 的顯示
   */
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible; // 切換狀態
    console.log(this.sidebarVisible);
    this.visibleEmit.emit(this.sidebarVisible); // 將狀態傳遞給 Layout
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const win = this.windowRef.nativeWindow;
    if (win) {
      this.checkScreenSize();
    }
  }

  private checkScreenSize(): void {
    const win = this.windowRef.nativeWindow;
    if (win && win.innerWidth < 768) {
      this.sidebarVisible = false;
    } else {
      this.sidebarVisible = true;
    }
    this.visibleEmit.emit(this.sidebarVisible);
  }

  /**
   * 回首頁
   */
  redirectHome() {
    this.router.navigate(['/']);
  }

  /**
   * 導向個人頁面
   */
  redirectPersonality() {
    this.router.navigate(['/users/personality']);
  }
}
