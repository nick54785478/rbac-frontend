export class UserFunctionQueried {
  id?: number;
  service!: string;
  code!: string; // 資料種類
  type?: string; // 種類
  name?: string; // 名稱
  actionType!: string; // 動作
  description?: string; // 敘述
  activeFlag?: string; // 順序號(從 1 開始)
  label!: string;
}
