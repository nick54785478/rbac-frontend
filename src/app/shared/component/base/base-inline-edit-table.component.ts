import { Component, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SystemMessageService } from '../../../core/services/system-message.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuItem, MessageService } from 'primeng/api';
import { Option } from '../../models/option.model';
import { BaseTableRow } from '../../models/base-table-row.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Table } from 'primeng/table';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';

/**
 * 定義基礎的 Form 表單 Component
 */
@Component({
  selector: 'app-base-form-compoent',
  standalone: true,
  imports: [],
  providers: [],
  template: '',
})
export abstract class BaseInlineEditeTableCompoent {
  /**
   * 上方頁簽
   * */
  protected detailTabs: MenuItem[] = [];

  /**
   * Table 內部屬性，用來新增資料
   * */
  protected minGivenIndex = -1;

  /**
   * 表格控制項
   */
  @ViewChild('dt') dataTable!: Table;

  /**
   * Cloned 資料，用來配置資料
   */
  protected clonedData: { [s: string]: any } = {};

  /**
   * 表格資料
   * */
  protected tableData: any[] = [];

  /**
   * 表格定義(如: 標題、值)
   * */
  protected cols: any[] = [];

  /**
   * 選中的那列資料 (亦可使用 tableData[selectedIndex] 來取得)
   * 此處設置的目的為將來維運方便
   * */
  protected selectedData: any;

  /**
   * 選中的 rowIndex
   */
  protected selectedIndex: number = -1;

  /**
   * 正在編輯的 那列資料 (亦可使用 tableData[editingIndex] 來取得)
   * 此處設置的目的為將來維運方便
   */
  protected editingRow: any;

  /**
   * 正在編輯的  rowIndex
   */
  protected editingIndex: number = -1;

  /**
   * 定義 Form Group
   * */
  protected formGroup!: FormGroup;

  /**
   * 用於 Submit 狀態
   * */
  protected submitted: boolean = false;

  /**
   * 刪除 ID 清單
   */
  protected deleteList: number[] = [];

  /**
   * 清除表單
   */
  protected clear() {}

  /**
   * 表單動作
   * */
  protected formAction!: string;

  /**
   * 表格內資料設定
   * */
  protected detailTabColumns: MenuItem[] = [];

  /**
   * 新增的空白列資料
   * */
  protected newRow!: any;

  /**
   * 新增的資料的 row index 清單
   */
  protected newRowIndexes: number[] = [];

  /**
   * 模式: add (新增)、edit (編輯)、delete (刪除)
   */
  protected mode!: string; // 模式

  constructor() {}

  /**
   * 根據 ID 清單刪除資料
   *@param rowData
   */
  protected remove(rowData: any) {}

  /**
   * 用於取得 AutoComplete 資料
   * @param $event
   */
  completeMethod($event: AutoCompleteCompleteEvent) {}

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
   * 將 json 字串轉為下拉式選單
   * @param rawString
   * @returns
   */
  protected passJsonToOption(rawString: string): Option[] {
    // 將單引號轉換為雙引號，讓 JSON 格式正確
    const jsonString = rawString.replace(/'/g, '"');

    // 解析為 JavaScript 物件
    const parsedArray = JSON.parse(jsonString);

    return parsedArray.map((item: any) => ({
      label: item.label,
      value: item.value,
    }));
  }

  /**
   * 檢查 Column 資料欄位(必填)是否為空
   * @param selectedData
   */
  checkRowData(selectedData?: any): void {
  }

  /**
   * 取得Inline Edit Table 的下拉選單資料
   * @param data 下拉選單參數名(通常是現有的)
   */
  loadDropdownData(col: any): any[] {
    return [];
  }

  /**
   * 根據 ID 清單刪除資料
   *@param ids
   */
  protected delete(ids: number[]) {}

  /**
   * 提交資料
   * @param tableData
   */
  protected submit(tableData: any[]) {}
}
