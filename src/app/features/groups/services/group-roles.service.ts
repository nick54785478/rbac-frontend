import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { UpdateGroupRoles } from '../models/update-group-roles-request.model';
import { BaseResponse } from '../../../shared/models/base-response.model';
import { GroupRoleQueried } from '../models/group-role-query.model';

@Injectable({
  providedIn: 'root',
})
export class GroupRolesService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 透過 ID 查詢角色資料
   * @param id
   */
  queryOthers(id: number): Observable<GroupRoleQueried[]> {
    const url = this.baseApiUrl + '/groups/roles/' + id + '/others';
    return this.http.get<GroupRoleQueried[]>(url);
  }

  /**
   * 提交更新或新增角色資料
   * @param requestData
   */
  update(requestData: UpdateGroupRoles): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/groups/roles/update';
    return this.http.post<BaseResponse>(url, requestData);
  }
}
