import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { SystemMessageSeverity } from '../enums/system-message-severity.enum';

@Injectable({
  providedIn: 'root',
})
export class SystemMessageService {
  constructor(public messageService: MessageService) {}

  /**
   * 顯示 Info (藍色) 訊息。
   *
   * @param summary 訊息標題
   * @param detail 訊息說明
   * @param sticky 是否持續顯示不會自動消失
   */
  info(detail: string, sticky?: boolean) {
    console.log(SystemMessageSeverity.INFO);
    this.messageService.clear('msg');
    this.addSingle(
      SystemMessageSeverity.INFO,
      'Info',
      detail,
      sticky ? sticky : false
    );
  }

  /**
   * 顯示 Success (綠色) 訊息。
   *
   * @param summary 訊息標題
   * @param detail 訊息說明
   * @param sticky 是否持續顯示不會自動消失
   */
  success(detail: string, sticky?: boolean) {
    this.addSingle(
      SystemMessageSeverity.SUCCESS,
      'Success',
      detail,
      sticky ? sticky : false
    );
  }

  /**
   * 顯示 Error (紅色) 訊息。
   *
   * @param summary 訊息標題
   * @param detail 訊息說明
   * @param sticky 是否持續顯示不會自動消失
   */
  error(detail: string, sticky?: boolean) {
    this.addSingle(
      SystemMessageSeverity.ERROR,
      'Error',
      detail,
      sticky ? sticky : false
    );
  }

  /**
   * 顯示一則訊息。
   *
   * @param severity 訊息嚴重性等級. SystemMessageSeverity 有 Success (綠色)、Info (藍色)、Warn (黃色)、Error (紅色)
   * @param summary 訊息標題
   * @param detail 訊息說明
   * @param sticky 是否持續顯示不會自動消失
   */
  addSingle(
    severity: SystemMessageSeverity,
    summary: string,
    detail: string,
    sticky?: boolean
  ) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      key: 'msg',
      sticky: sticky,
    });
  }
  /**
   * 顯示多則訊息。
   *
   * @param messages
   */
  addMultiple(messages: Message[]) {
    this.messageService.addAll(messages);
  }

  /**
   * 清除所有的訊息。
   */
  clear() {
    this.messageService.clear();
  }
}
