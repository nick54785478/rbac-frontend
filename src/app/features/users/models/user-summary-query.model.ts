export class UserSummaryQueried {
  id!: number;
  name!: string; // 資料種類
  email!: string; // 種類
  username!: string; // 名稱
  address!: string; // 敘述
  nationalIdNo!: string;
  birthday!: string;
  groups!: UserGroupSummaryQueried[];
  roles!: UserRoleSummaryQueried[];
}

export class UserRoleSummaryQueried {
  id!: number;
  name!: string;
  service!: string;
  code!: string;
  type!: string;
  description!: string;
  activeFlag!: string;
}

export class UserGroupSummaryQueried {
  id?: number;
  service?: string;
  code!: string; // 資料種類
  name!: string;
  displayName!: string;
}
