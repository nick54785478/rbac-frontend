import { Subject } from "rxjs";

export class AutoCompleteStatus {
  /**
   * autoComplete 欄位修改前的值。
   * 用來判斷 autoComplete 元件輸入值有沒有改變。
   */
  autoCompletePreviousValue: string = '';

  /**
   * 執行按鈕動作時，用來判斷是否需要等 autoComplete completeMethod 完成。
   */
  waitAutoComplete: boolean = false;

  /**
   * autoComplete completeMethod 完成通知。
   */
  autoCompleteSubject$ = new Subject<void>();

  /**
   * autoComplete 是否按下清除。
   */
  isCleared: boolean = false;
}
