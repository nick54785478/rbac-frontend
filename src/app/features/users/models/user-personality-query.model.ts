import { UserGroupQueried } from './user-group-query.model';
import { UserRoleQueried } from './user-roles-query.model';

export class UserPersonalityQueried {
  id!: number;
  name!: string; // 資料種類
  email!: string; // 種類
  username!: string; // 名稱
  address!: string; // 敘述
  birthday!: Date;
  nationalIdNo!: string;
  groups!: UserGroupQueried[];
  roles!: UserRoleQueried[];
  givenId: any; // 前端自定義，只有被新增的資料才會被賦予
}
