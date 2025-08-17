export class SettingQueried {
  dataType?: string; // 資料種類
  type?: string; // 種類
  name?: string; // 名稱
  code?: string;
  value?: string;
  description!: string; // 敘述
  priorityNo?: number; // 順序號(從 1 開始)
  activeFlag!: string;
}
