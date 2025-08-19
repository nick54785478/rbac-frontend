import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
   * 透過 ID 與服務查詢不屬於該群組的角色資料
   * @param id
   * @param service
   * @returns
   */
  queryOthers(id: number, service: string): Observable<GroupRoleQueried[]> {
    const url = this.baseApiUrl + '/groups/roles/' + id + '/others';
    let params = new HttpParams().set('service', service ? service : '');
    return this.http.get<GroupRoleQueried[]>(url, { params });
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
