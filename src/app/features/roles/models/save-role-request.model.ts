export class SaveRole {
  id?: number;
  service?: string;
  code!: string; // 資料種類
  type?: string; // 種類
  name?: string; // 名稱
  description?: string; // 敘述
  activeFlag?: string; // 順序號(從 1 開始)
}
