import { Injectable } from '@angular/core';
import { UserGroupQueried } from '../models/user-group-query.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UpdateUserGroups } from '../models/update-user-groups-request.model';
import { BaseResponse } from '../../../shared/models/base-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserGroupsService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 透過 username 查詢其他群組資料(不屬於該使用者的)
   * @param username
   */
  queryOthers(username: string): Observable<UserGroupQueried[]> {
    const url = this.baseApiUrl + '/users/groups/' + username + '/others';
    return this.http.get<UserGroupQueried[]>(url);
  }

  /**
   * 提交更新或新增角色資料
   * @param requestData
   */
  update(requestData: UpdateUserGroups): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/users/groups/update';
    return this.http.post<BaseResponse>(url, requestData);
  }
}
