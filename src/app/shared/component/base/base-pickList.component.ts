import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SystemMessageService } from '../../../core/services/system-message.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

/**
 * 定義基礎的 Form 表單 Component
 */
@Component({
  selector: 'app-base-pickList-compoent',
  standalone: true,
  imports: [],
  providers: [],
  template: '',
})
export abstract class BasePickListCompoent {
  // 定義 Form Group
  protected formGroup!: FormGroup;

  protected submitted: boolean = false; // 用於 Submit 用

  protected formAction!: string; // 表單動作

  sourceList: any[] = []; // 可選資料清單
  targetList: any[] = []; // 選擇後資料清單
  detailTabs: any[] = []; // PickList 上方 Tab 按鈕選單

  constructor() {}

  /**
   * Patch FormGroup 的值
   * @param data
   */
  patchFormGroupValue(data?: any) {}

  /**
   * 取得 FormControl。
   * @param formControlName formControlNameformControl 的名稱
   * @returns FormControl
   */
  formControl(formControlName: string): FormControl {
    return this.formGroup.get(formControlName) as FormControl;
  }

  /**
   * 判斷 formControl 欄位是否有錯誤。
   * @param formControlName formControl 的名稱
   * @returns boolean 欄位是否有錯誤
   */
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    if (formControl) {
      return formControl.invalid && (formControl.dirty || this.submitted);
    } else {
      return false;
    }
  }

  /**
   * 從 Source 移動至 Target
   * @param event
   */
  protected onMoveToTarget(event: any) {
    // 避免可能存在未定義或空對象。
    // Typescript 會靠北
    if (!event || !event.item) {
      return;
    }
    // 濾掉該筆資料
    this.sourceList = this.sourceList.filter(
      (item) => item.id !== event?.item.id
    );
    this.targetList.push(event.item);
    console.log(event);
  }

  /**
   * 從 Target 移動至 Source
   * @param event
   */
  protected onMoveToSource(event: any) {
    console.log(event);

    // 避免可能存在未定義或空對象。
    // Typescript 會靠北
    if (!event || !event.item) {
      return;
    }
    // 濾掉該筆資料
    this.targetList = this.targetList.filter(
      (item) => item.id !== event.item?.id
    );
    this.sourceList.push(event.item);
  }
}
