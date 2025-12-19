import { FunctionQueried } from '../../functions/models/function-query.model';
import { UserFunctionQueried } from './user-function-query.model';
import { UserGroupQueried } from './user-group-query.model';
import { UserRoleQueried } from './user-roles-query.model';

export class UserDetailQueried {
  id!: number;
  name!: string; // 資料種類
  email!: string; // 種類
  username!: string; // 名稱
  address!: string; // 敘述
  nationalIdNo!: string;
  birthday!: string;
  activeFlag!: string;
  groups!: UserGroupQueried[];
  roles!: UserRoleQueried[];
  functions!: UserFunctionQueried[];
}
