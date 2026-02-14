import { RoleQueried } from '../../roles/models/role-query.model';

export class GroupInfoQueried {
  id?: number;
  service!: string;
  code!: string; // 資料種類
  type?: string; // 種類
  name?: string; // 名稱
  description?: string; // 敘述
  activeFlag?: string;
  givenIndex?: number; // 前端自定義，只有被新增的資料才會被賦予
}
