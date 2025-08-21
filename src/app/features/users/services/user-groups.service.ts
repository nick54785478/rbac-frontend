import { Injectable } from '@angular/core';
import { UserGroupQueried } from '../models/user-group-query.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  queryOthers(
    username: string,
    service: string
  ): Observable<UserGroupQueried[]> {
    const url = this.baseApiUrl + '/users/groups/' + username + '/others';
    let params = new HttpParams().set('service', service ? service : '');
    return this.http.get<UserGroupQueried[]>(url, { params });
  }

  /**
   * 提交更新或新增角色資料
   * @param requestData
   */
  update(requestData: UpdateUserGroups): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/users/groups/update';
    return this.http.post<BaseResponse>(url, requestData);
  }

  /**
   * 查詢符合條件的使用者群組資料
   * @param username
   * @returns
   */
  queryGroups(
    username: string,
    service: string
  ): Observable<UserGroupQueried[]> {
    const url = this.baseApiUrl + '/users/groups/' + username;
    let params = new HttpParams().set('service', service ? service : '');
    return this.http.get<UserGroupQueried[]>(url, { params });
  }
}
