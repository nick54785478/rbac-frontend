import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { provideHttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingMaskService } from './core/services/loading-mask.service';
import { delay } from 'rxjs/internal/operators/delay';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { DomHandler } from 'primeng/dom';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedModule, CoreModule],
  providers: [MessageService, LoadingMaskService, ConfirmationService], // 要在此處注入 Message Service ，否則 Toast 訊息不會有作用
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'auth-frontend';

  showLoadingMask: boolean = false;

  private readonly _destroying$ = new Subject<void>();

  constructor(private loadingMaskService: LoadingMaskService) {}

  ngOnInit(): void {
    this.loadingMaskService.status$
      .pipe(delay(1), takeUntil(this._destroying$))
      .subscribe((val: boolean) => {
        this.showLoadingMask = val;
      });
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
  }

  /**
   * 在第一個 Dialog 未關閉的狀況下，裡面如果出現提示訊息，或是又開另一個 Dialog，又關閉會出現另一條 scrollbar，
   * 這個是把第二條 scrollbar 取消
   */
  confirmDialogHide(): void {
    // 第一層是為了解決開啟 Dialog 後，按下刪除，會直接把 Dialog 關閉，這時候馬上去偵測 'p-dynamicdialog' 其實還在
    // 如果這時候把 scrollbar 取消，回到前面畫面就不能捲了
    setTimeout(() => {
      if (DomHandler.findSingle(document.body, 'p-dynamicdialog')) {
        let id = setInterval(() => {
          if (!DomHandler.hasClass(document.body, 'p-overflow-hidden')) {
            DomHandler.addClass(document.body, 'p-overflow-hidden');
          }
        }, 50);

        setTimeout(() => {
          clearInterval(id);
        }, 1000);
      }
    }, 1000);
  }
}
