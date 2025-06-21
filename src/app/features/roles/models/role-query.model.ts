import { FunctionQueried } from '../../functions/models/function-query.model';

export class RoleQueried {
  id?: number;
  service!: string; // 服務
  code!: string; // 資料種類
  type?: string; // 種類
  name?: string; // 名稱
  description?: string; // 敘述
  activeFlag?: string;
  functions?: FunctionQueried[];
  givenIndex?: number; // 前端自定義，只有被新增的資料才會被賦予
}
