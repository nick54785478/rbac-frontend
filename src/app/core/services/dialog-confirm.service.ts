import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class DialogConfirmService {
  constructor(private confirmationService: ConfirmationService) {}

  /**
   * 顯示確認是否刪除的對話框。
   *
   * @param acceptCallback 按下是之後要執行的 function
   * @param hint 要刪除的資料關鍵字
   * @param rejectCallback 按下否之後要執行的 function
   */
  confirmDelete(
    acceptCallback: Function,
    hint?: string,
    rejectCallback?: Function
  ) {
    if (hint) {
      this.confirm(
        '刪除訊息',
        '您確定要刪除「{{ hint }}」這筆資料嗎 ?',
        'pi pi-info-circle',
        acceptCallback,
        { hint: hint },
        'YES',
        rejectCallback
      );
    } else {
      this.confirm(
        '刪除訊息',
        '您確定要刪除這筆資料嗎 ?',
        'pi pi-info-circle',
        acceptCallback,
        undefined,
        'YES',
        rejectCallback
      );
    }
  }

  /**
   * 顯示確認變更未儲存的對話框。
   *
   * @param acceptCallback 按下是之後要執行的 function
   * @param rejectCallback 按下否之後要執行的 function
   */
  confirmUnsaved(acceptCallback: Function, rejectCallback?: Function) {
    this.confirm(
      '確認',
      '您確定要確認變更未儲存的資料嗎 ?',
      'pi pi-info-circle',
      acceptCallback,
      undefined,
      '離開',
      rejectCallback
    );
  }

  /**
   * 顯示確認放棄未儲存的對話框。
   *
   * @param acceptCallback 按下是之後要執行的 function
   * @param rejectCallback 按下否之後要執行的 function
   */
  confirmDiscardChanges(acceptCallback: Function, rejectCallback?: Function) {
    this.confirm(
      '確認',
      '您確定要放棄所有未儲存的變更嗎 ?',
      'pi pi-info-circle',
      acceptCallback,
      undefined,
      '放棄',
      rejectCallback
    );
  }

  /**
   * 顯示確認對話框。
   *
   * @param header 對話框的 Header
   * @param message 要確認的訊息
   * @param iconClass 訊息前 icon 的 style class
   * @param acceptCallback 按下是之後要執行的 function
   * @param parameters 要確認的訊息要傳遞的參數
   * @param acceptLabel 接受按鈕的文字
   * @param rejectCallback 按下否之後要執行的 function
   * @param rejectLabel 拒絕按鈕的文字
   */
  confirm(
    header: string,
    message: string,
    iconClass: string,
    acceptCallback: Function,
    parameters?: Object,
    acceptLabel?: string,
    rejectCallback?: Function,
    rejectLabel?: string
  ) {
    this.confirmationService.confirm({
      message: message,
      header: header,
      icon: iconClass,
      acceptLabel: acceptLabel,
      rejectLabel: rejectLabel,
      accept: () => {
        acceptCallback();
      },
      reject: () => {
        if (typeof rejectCallback === 'function') {
          rejectCallback();
        }
      },
    });
  }
}
