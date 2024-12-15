import { Injectable } from '@angular/core';
import { RegisterUser } from '../models/register-user-request.model';
import { Observable } from 'rxjs/internal/Observable';
import { BaseResponse } from '../../../shared/models/base-response.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserQueried } from '../models/user-query.model';
import { UserRoleQueried } from '../models/user-roles-query.model';
import { UserGroupQueried } from '../models/user-group-query.model';
import { UserDetailQueried } from '../models/user-detail-query.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 進行註冊動作
   * @param request
   */
  create(request: RegisterUser): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/users/register';
    return this.http.post<BaseResponse>(url, request);
  }

  /**
   * 查詢使用者詳細資訊
   * @param username
   * @returns
   */
  query(username: string): Observable<UserQueried | UserDetailQueried> {
    const url = this.baseApiUrl + '/users' + '/' + username + '/details';
    return this.http.get<UserQueried | UserDetailQueried>(url);
  }

  /**
   * 查詢符合條件的使用者群組資料
   * @param username
   * @returns
   */
  queryGroups(username: string): Observable<UserGroupQueried[]> {
    const url = this.baseApiUrl + '/users' + '/' + username + '/groups';
    return this.http.get<UserGroupQueried[]>(url);
  }

  /**
   * 查詢符合條件的使用者角色資料
   */
  queryRoles(username: string): Observable<UserRoleQueried[]> {
    const url = this.baseApiUrl + '/users' + '/' + username + '/roles';
    return this.http.get<UserRoleQueried[]>(url);
  }
}
