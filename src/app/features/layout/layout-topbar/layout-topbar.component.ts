import { CommonModule } from '@angular/common';
import {
  Component,
  DoCheck,
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
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { SystemStorageKey } from '../../../core/enums/system-storage.enum';
import { defaultIfEmpty, firstValueFrom, of, tap } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';

@Component({
  selector: 'app-layout-topbar',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './layout-topbar.component.html',
  styleUrl: './layout-topbar.component.scss',
  providers: [LayoutService, StorageService, AuthService],
})
export class LayoutTopbarComponent implements OnInit {
  @Output() visibleEmit = new EventEmitter<boolean>();

  @ViewChild('tLanguageMenu') tLanguageMenu!: Menu; // 語系切換，目前尚未實作
  isLanguageMenuOpen: boolean = false; // 語系選單顯示Flag
  languages: MenuItem[] = []; // 語系選單

  sidebarVisible: boolean = false; // 本地變數，監聽 SideBar 狀態

  userProfile: UserProfile = new UserProfile(); // 使用者資訊

  constructor(
    private windowRef: WindowRefService,
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private primengConfig: PrimeNGConfig
  ) {}

  async ngOnInit(): Promise<void> {
    const win = this.windowRef.nativeWindow;
    if (win) {
      this.checkScreenSize();
    }

    this.primengConfig.ripple = true;

    // 載入 UserProfile
    this.userProfile.username = await firstValueFrom(
      of(
        this.storageService.getLocalStorageItem(SystemStorageKey.USERNAME) ||
          this.storageService.getSessionStorageItem(SystemStorageKey.USERNAME)
      ).pipe(
        tap((value) => console.log('username value:', value)),
        defaultIfEmpty('')
      )
    );

    this.userProfile.name = await firstValueFrom(
      of(
        this.storageService.getLocalStorageItem(SystemStorageKey.NAME) ||
          this.storageService.getSessionStorageItem(SystemStorageKey.NAME)
      ).pipe(
        tap((value) => console.log('name value:', value)),
        defaultIfEmpty('')
      )
    );

    console.log(this.userProfile);

    /**
     * Languages 語系，可新增(用於以後若要實作 i18n)
     */
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

  /**
   * 監測螢幕 Size
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const win = this.windowRef.nativeWindow;
    if (win) {
      this.checkScreenSize();
    }
  }

  /**
   * 檢查螢幕 Size 自動關閉左側欄
   */
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
    if (!this.userProfile.username || !this.userProfile.name) {
      return;
    }
    this.router.navigate(['/users/personality']);
  }

  /**
   * 使用者登出
   */
  logout() {
    this.authService.clearToken();
    this.storageService.removeSessionStorageItem(SystemStorageKey.QUERY_PARAMS);
    this.storageService.removeSessionStorageItem(SystemStorageKey.REDIRECT_URL);
    this.storageService.removeLocalStorageItem(SystemStorageKey.REFRESH_TOKEN);
    this.storageService.removeLocalStorageItem(SystemStorageKey.NAME);
    this.storageService.removeSessionStorageItem(SystemStorageKey.NAME);
    this.storageService.removeLocalStorageItem(SystemStorageKey.USERNAME);
    this.storageService.removeSessionStorageItem(SystemStorageKey.USERNAME);
    this.storageService.removeLocalStorageItem(SystemStorageKey.PERMISSIONS);
    this.router.navigate(['/login']);
  }
}
