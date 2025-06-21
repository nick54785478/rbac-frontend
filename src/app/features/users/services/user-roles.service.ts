import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UserRoleQueried } from '../models/user-roles-query.model';
import { Observable } from 'rxjs/internal/Observable';
import { UpdateUserRoles } from '../models/update-user-roles-request.model';
import { BaseResponse } from '../../../shared/models/base-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserRolesService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 透過 username 查詢其他群組資料(不屬於該使用者的)
   * @param username
   * @param service
   */
  queryOthers(
    username: string,
    service: string
  ): Observable<UserRoleQueried[]> {
    const url = this.baseApiUrl + '/users/roles/' + username + '/others';
    let params = new HttpParams().set('service', service ? service : '');
    return this.http.get<UserRoleQueried[]>(url, { params });
  }

  /**
   * 提交更新或新增角色資料
   * @param requestData
   */
  update(requestData: UpdateUserRoles): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/users/roles/update';
    return this.http.post<BaseResponse>(url, requestData);
  }
}
