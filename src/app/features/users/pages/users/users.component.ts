import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { SharedModule } from '../../../../shared/shared.module';
import { BaseFormCompoent } from '../../../../shared/component/base/base-form.component';
import { DialogFormComponent } from '../../../../shared/component/dialog-form/dialog-form.component';
import { CoreModule } from '../../../../core/core.module';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { UserInfoOption } from '../../../../shared/models/userinfo-option.model';
import { OptionService } from '../../../../shared/services/option.service';
import { debounceTime, finalize, switchMap } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { SystemMessageService } from '../../../../core/services/system-message.service';
import { LoadingMaskService } from '../../../../core/services/loading-mask.service';
import { UserConfigureAction } from '../../../../core/enums/user-config-action.enum';
import { UserGroupsComponent } from '../user-groups/user-groups.component';
import { UserRolesComponent } from '../user-roles/user-roles.component';
import { Location } from '@angular/common';
import { StorageService } from '../../../../core/services/storage.service';
import { SystemStorageKey } from '../../../../core/enums/system-storage.enum';
import { MaintainPermission } from '../../../../core/enums/maintain-permission.enum';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SharedModule, CoreModule], // 將 ShareModule import
  templateUrl: './users.component.html',
  providers: [
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
    OptionService,
  ],
  styleUrl: './users.component.scss',
})
export class UsersComponent
  extends BaseFormCompoent
  implements OnInit, OnDestroy, DoCheck
{
  ref!: DynamicDialogRef; // dialog
  dialogOpened!: boolean;
  userinfos: UserInfoOption[] = []; // AutoComplete 下拉式選單資料
  selectedData!: any;
  cols: any[] = [];
  tableData: any[] = [];
  detailTabs: any[] = [];
  activeField: string = ''; // 用以激活當前的頁面
  pageContents: any; // 當前頁面內容配置
  userQueridData!: any; // 後端查詢使用者資料

  // AutoComplete 與其下拉欄位值變動的 Subject，用來避免前次查詢較慢返回覆蓋後次資料
  private autoCompleteDataSubject$ = new Subject<string>();

  /**
   * 用來取消訂閱
   */
  readonly _destroying$ = new Subject<void>();

  constructor(
    private location: Location,
    private loadingMaskService: LoadingMaskService,
    private messageService: SystemMessageService,
    private userService: UsersService,
    private dynamicDialogRef: DynamicDialogRef,
    public dialogService: DialogService,
    private optionService: OptionService,
    private storageService: StorageService
  ) {
    super();
  }

  ngOnDestroy(): void {
    this.autoCompleteDataSubject$.unsubscribe;
  }

  ngOnInit(): void {
    // 監聽上一頁切換，關閉 Dialog
    this.location.onUrlChange(() => {
      this.closeFormDialog();
    });

    this.formGroup = new FormGroup({
      userInfo: new FormControl('', [Validators.required]),
    });

    this.pageContents = {
      info: {
        title: '使用者資料頁面',
        cols: [
          { field: 'username', header: '帳號' },
          { field: 'name', header: '姓名' },
          { field: 'email', header: '信箱' },
          { field: 'address', header: '地址' },
        ],
        tableData: 'userInfo',
      },
      groups: {
        title: '群組頁面',
        cols: [
          { field: 'type', header: '種類' },
          { field: 'name', header: '名稱' },
          { field: 'code', header: '代碼' },
          { field: 'description', header: '說明' },
          { field: 'activeFlag', header: '是否生效' },
        ],
        tableData: 'groups',
      },
      roles: {
        title: '角色頁面',
        cols: [
          { field: 'type', header: '種類' },
          { field: 'name', header: '名稱' },
          { field: 'code', header: '代碼' },
          { field: 'description', header: '說明' },
          { field: 'activeFlag', header: '是否生效' },
        ],
        tableData: 'roles',
      },
      functions: {
        title: '功能頁面',
        cols: [
          { field: 'label', header: '權限' },
          { field: 'type', header: '種類' },
          { field: 'name', header: '名稱' },
          { field: 'code', header: '代碼' },
          { field: 'description', header: '說明' },
          { field: 'activeFlag', header: '是否生效' },
        ],
        tableData: 'roles',
      },
    };

    // 初始化上方 Tab 按鈕
    this.detailTabs = [
      {
        label: '使用者資料',
        field: 'info',
        icon: '',
        command: (event: any) => this.onTabChange(event, 'info'),
        disabled: this.activeField === '',
      },
      {
        label: '群組',
        field: 'groups',
        icon: '',
        command: (event: any) => this.onTabChange(event, 'groups'),
        disabled: this.activeField === '',
      },
      {
        label: '角色',
        field: 'roles',
        icon: '',
        command: (event: any) => this.onTabChange(event, 'roles'),
        disabled: this.activeField === '',
      },
      ,
      {
        label: '功能',
        field: 'functions',
        icon: '',
        command: (event: any) => this.onTabChange(event, 'functions'),
        disabled: this.activeField === '',
      },
    ];
  }

  ngDoCheck(): void {
    // 初始化上方 Tab 按鈕
    this.detailTabs = [
      {
        label: '使用者資料',
        field: 'info',
        icon: '',
        command: (event: any) => this.onTabChange(event, 'info'),
        disabled: this.activeField === '',
      },
      {
        label: '群組',
        field: 'groups',
        icon: '',
        command: (event: any) => this.onTabChange(event, 'groups'),
        disabled: this.activeField === '',
      },
      {
        label: '角色',
        field: 'roles',
        icon: '',
        command: (event: any) => this.onTabChange(event, 'roles'),
        disabled: this.activeField === '',
      },
      ,
      {
        label: '功能',
        field: 'functions',
        icon: '',
        command: (event: any) => this.onTabChange(event, 'functions'),
        disabled: this.activeField === '',
      },
    ];
  }

  /**
   * 切換 Tab 時執行顯示下方表格資料
   * @param event
   * @param  field
   * */
  onTabChange(event: any, field: string) {
    console.log('Tab changed:', event, field);
    this.activeField = field;

    // if (this.tableData.length === 0) {
    //   return;
    // }

    switch (this.activeField) {
      case 'info':
        this.tableData = Array.of(this.userQueridData);
        return;
      case 'groups':
        this.tableData = this.userQueridData.groups;
        return;
      case 'roles':
        this.tableData = this.userQueridData.roles;
        return;
      case 'functions':
        this.tableData = this.userQueridData.functions;
        return;
      default:
        return;
    }
  }

  /**
   * 開始進行使用者配置
   * @param action
   */
  onStartUserConfig(action: string) {
    this.dialogOpened = true;
    console.log(this.formControlInvalid('userInfo'));

    if (!this.dialogOpened || !this.formGroup.valid) {
      return;
    }
    this.openFormDialog(action, this.formGroup.value);
  }

  /**
   * 開啟 Dialog 表單
   * @param action
   * @param data
   * @returns DynamicDialogRef
   */
  openFormDialog(action: string, data: any): DynamicDialogRef {
    let userInfo = data.userInfo;

    let permissions = this.storageService.getPermissionList();

    // Component
    let page: any =
      action === UserConfigureAction.GROUPS
        ? UserGroupsComponent
        : UserRolesComponent;
    // 標題
    let header: string =
      action === UserConfigureAction.GROUPS
        ? '使用者群組配置'
        : '使用者角色配置';

    const ref = this.dialogService.open(DialogFormComponent, {
      header: header,
      width: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        action: action,
        data: userInfo, // 將 userInfo 傳入
      },
      templates: {
        content: page,
      },
    });
    // Dialog 關閉後要做的事情
    ref?.onClose
      .pipe(takeUntil(this._destroying$))
      .subscribe((returnData: any) => {
        console.log('關閉 Dialog');
        // 更改 dialogOpened
        this.dialogOpened = false;
      });
    return ref;
  }

  /**
   * 關閉 Dialog 表單
   */
  closeFormDialog() {
    this.dialogOpened = false;
    this.dynamicDialogRef.close();
  }

  /**
   * 清除表單資料
   */
  clear() {
    this.formGroup.reset();
    this.userQueridData = null;
    this.tableData = [];
    this.activeField = '';
  }

  /**
   * 查詢該使用者資料
   */
  query() {
    let userInfo = this.formGroup.value.userInfo;

    this.submitted = true;
    if (!this.formGroup.valid || !this.submitted) {
      return;
    }
    this.activeField = 'info';
    this.loadingMaskService.show();
    this.userService
      .query(userInfo.username)
      .pipe(
        finalize(() => {
          // 無論成功或失敗都會執行
          this.loadingMaskService.hide();
          this.submitted = false;
        })
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.messageService.success('查詢成功');
          this.userQueridData = res;

          this.tableData = Array.of(res);
          // console.log(this.tableData);
        },
        error: (error) => {
          this.messageService.error(error.message);
        },
      });
  }

  /**
   * 取得使用者帳號資訊
   */
  getUserInfos(event: any) {
    if (!this.autoCompleteDataSubject$.observed) {
      // 初始化 AutoComplete 的訂閱
      this.autoCompleteDataSubject$
        .pipe(
          debounceTime(300), // 防抖，避免頻繁發請求
          switchMap((keyword) => {
            return this.optionService.getUserOptions(keyword);
          }), // 自動取消上一次未完成的請求
          takeUntil(this._destroying$)
        )
        .subscribe((res) => {
          this.userinfos = res.map((item: any) => ({
            id: item.id, // 保留 id
            name: item.name, // 保留 name
            username: item.username, // 保留 nameEn
            displayName: `${item.name} (${item.username})`, // 生成 displayName
          }));
        });
    }
    this.autoCompleteDataSubject$.next(event.query);
  }
}
