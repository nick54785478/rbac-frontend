import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { FunctionsService } from '../../services/functions.service';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Option } from '../../../../shared/models/option.model';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { BaseInlineEditeTableCompoent } from '../../../../shared/component/base/base-inline-edit-table.component';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { OptionService } from '../../../../shared/services/option.service';
import { SettingType } from '../../../../core/enums/setting-type.enum';
import { CoreModule } from '../../../../core/core.module';
import { finalize } from 'rxjs/internal/operators/finalize';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { SaveFunction } from '../../models/save-functions-request.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { error } from 'console';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-functions',
  standalone: true,
  imports: [CommonModule, SharedModule, CoreModule],
  providers: [SystemMessageService, OptionService],
  templateUrl: './functions.component.html',
  styleUrl: './functions.component.scss',
})
export class FunctionsComponent
  extends BaseInlineEditeTableCompoent
  implements OnInit, OnDestroy
{
  constructor(
    private loadingMaskService: LoadingMaskService,
    private optionService: OptionService,
    private functionService: FunctionsService,
    private messageService: SystemMessageService
  ) {
    super();
  }
  ngOnInit(): void {
    // 初始化上方 Tab 按鈕
    this.detailTabs = [
      {
        label: '新增',
        icon: 'pi pi-plus',
        command: () => {
          this.addNewRow();
        },
        disabled: false,
      },
      {
        label: '提交',
        icon: 'pi pi-save',
        command: () => {
          this.submit();
        },
        disabled: false,
      },
      {
        label: '放棄',
        icon: 'pi pi-times',
        command: () => {
          this.cancelAll();
        },
        disabled: false,
      },
    ];
    // 初始化表單
    this.formGroup = new FormGroup({
      actionType: new FormControl(''), // 動作種類
      type: new FormControl(''), // 種類
      name: new FormControl(''), // 功能名稱
      activeFlag: new FormControl(''), // 是否生效
    });

    // 初始化 Table 配置
    this.cols = [
      {
        field: 'type',
        header: '配置種類',
        type: 'dropdown',
        required: 'true',
      },
      {
        field: 'actionType',
        header: '動作',
        type: 'dropdown',
        required: 'true',
      },

      {
        field: 'code',
        header: '功能代碼',
        type: 'inputText',
        required: 'true',
      },
      {
        field: 'name',
        header: '名稱',
        type: 'inputText',
        required: 'true',
      },
      {
        field: 'description',
        header: '說明',
        type: 'textArea',
        required: 'true',
      },
      {
        field: 'activeFlag',
        header: '是否生效',
        type: 'dropdown',
        required: 'true',
      },
    ];

    // 初始化下拉選單資料
    forkJoin({
      types: this.optionService.getSettingTypes(SettingType.FUNCTION),
      activeFlags: this.optionService.getSettingTypes(SettingType.YES_NO),
      actionTypes: this.optionService.getSettingTypes(SettingType.ACTION_TYPE),
    }).subscribe({
      next: (res) => {
        this.types = res.types;
        this.activeFlags = res.activeFlags;
        this.actionTypes = res.actionTypes;
      },
      error: (error) => {
        this.messageService.error(error);
      },
    });
  }

  // Active Flag 的下拉式選單
  activeFlags: Option[] = [];
  // 配置種類的下拉式選單
  types: Option[] = [];
  // ActionTypes 的下拉式選單
  actionTypes: Option[] = [];

  /**
   * 清除表單資料
   */
  override clear() {
    this.tableData = [];
    this.minGivenIndex = -1;
    this.formGroup.reset();
  }

  ngOnDestroy() {}

  // 提交資料
  override submit() {
    this.submitted = true;
    const requestData: SaveFunction[] = this.tableData.map((data) => {
      return {
        id: data.id,
        actionType: data.actionType,
        code: data.code,
        type: data.type,
        name: data.name,
        description: data.description,
        activeFlag: data.activeFlag,
      };
    });

    if (this.submitted) {
      this.loadingMaskService.show();
      this.functionService
        .submit(requestData)
        .pipe(
          finalize(() => {
            this.submitted = false;
            this.loadingMaskService.hide();
            // 無論成功或失敗都會執行
            this.query();
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.code === 'VALIDATION_FAILED') {
              this.messageService.error(res.message);
            } else {
              this.messageService.success(res.message);
            }
          },
          error: (error) => {
            this.messageService.error(error.message);
          },
        });
    }
  }

  /**
   * 透過特定條件查詢設定資料
   */
  query() {
    this.loadingMaskService.show();
    // 查詢前先取消所有
    this.cancelAll();
    let formData = this.formGroup.value;
    this.functionService
      .query(formData.type, formData.name, formData.activeFlag)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.loadingMaskService.hide();
        })
      )
      .subscribe({
        next: (res) => {
          this.messageService.success('查詢成功');
          this.tableData = res;
          // 對所有資料進行編號
          for (var i = 0; i < this.tableData.length; i++) {
            this.tableData[i].givenIndex = i;
          }

          console.log(this.tableData);
        },
        error: (error) => {
          this.messageService.error(error.message);
        },
      });
  }

  /**
   * 切換 編輯模式
   * @param givenIndex
   * @returns
   */
  onEdit(rowData: any) {
    console.log(rowData);
    this.clonedData[rowData.givenIndex] = { ...rowData };
  }

  /**
   * 判斷是否為編輯模式
   * @param givenIndex
   * */
  isEditing(givenIndex: any): boolean {
    return this.editingIndex === givenIndex;
  }

  /**
   * 取消編輯/新增
   * */
  cancel(rowData: any, rowIndex: number) {
    console.log(rowIndex);
    this.tableData[rowIndex] = this.clonedData[rowData.givenIndex];
    delete this.clonedData[rowData.givenIndex];
  }

  /**
   * 回歸原狀，原先新增的資料全部放棄。
   */
  cancelAll() {}

  /**
   * Table Action 按鈕按下去的時候要把該筆資料記錄下來。
   * @param rowData 點選的資料
   */
  clickRowActionMenu(rowData: any): void {
    this.selectedData = rowData;
  }

  /**
   * 新增一筆空的 row 資料
   * */
  addNewRow(): void {
    this.newRow = {
      id: null,
      actionType: '',
      name: '',
      type: this.formGroup.get('type')?.value
        ? this.formGroup.get('type')?.value
        : '',
      description: '',
      givenIndex: this.minGivenIndex--, // 前端給予的編號資料
    };
    console.log(this.minGivenIndex);
    this.tableData.unshift(this.newRow);
    // this.onEdit(this.newRow);
    // 觸發該 row 的編輯模式
    setTimeout(() => {
      this.dataTable.initRowEdit(this.newRow);
    });
  }

  /**
   * 進行刪除
   * @param id
   * @param isSelected 是否被選中
   */
  onDelete(id: number, isSelected: boolean) {
    // 如果不包含該 id 加入
    if (isSelected) {
      // 若選中，添加到陣列
      this.deleteList.push(id);
    } else {
      // 若取消選中，從陣列移除
      this.deleteList = this.deleteList.filter((e) => e !== id);
    }
    console.log(this.deleteList);
  }

  // 刪除幾列資料
  override delete(ids: number[], event?: Event) {
    this.functionService
      .delete(ids)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.query();
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.code === 'VALIDATION_FAILED') {
            this.messageService.error(res.message);
          } else {
            this.messageService.success(res.message);
          }
        },
        error: (error) => {
          this.messageService.error(error.message);
        },
      });
  }

  // 檢查 row 資料是否有未填欄位
  override checkRowData(selectedData: any): void {
    if (
      !selectedData.type ||
      !selectedData.actionType ||
      !selectedData.name ||
      !selectedData.code ||
      !selectedData.description ||
      !selectedData.activeFlag
    ) {
      this.dataTable.initRowEdit(selectedData);
    }
  }

  /**
   * 判斷Type欄位是否可修改
   * @param rowData 該 row 的資料
   * @param field 欄位名稱
   * @returns
   */
  isFieldDisabled(rowData: any, field: string): boolean {
    if (
      (field === 'type' &&
        rowData.id !== null &&
        this.formGroup.get('type')?.value !== '') ||
      (rowData.id !== null && this.formGroup.get('name')?.value !== '')
    ) {
      return true;
    }
    return false;
  }

  /**
   * 載入 dropdown 資料
   * @param col
   * @returns
   */
  override loadDropdownData(col: any): any[] {
    // 如果已經載入過資料，則不再重新請求
    switch (col.field) {
      case 'type':
        return this.types;
      case 'activeFlag':
        return this.activeFlags;
      case 'actionType':
        return this.actionTypes;
      default:
        return [];
    }
  }
}
