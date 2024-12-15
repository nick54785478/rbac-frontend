import { RoleQueried } from '../../roles/models/role-query.model';

export class GroupQueried {
  id?: number;
  code!: string; // 資料種類
  type?: string; // 種類
  name?: string; // 名稱
  description?: string; // 敘述
  roles?: RoleQueried[];
  activeFlag?: string;
  givenIndex?: number; // 前端自定義，只有被新增的資料才會被賦予
}
