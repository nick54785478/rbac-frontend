import { Injectable } from '@angular/core';
import { RegisterUser } from '../../register/models/register-user-request.model';
import { Observable } from 'rxjs/internal/Observable';
import { BaseResponse } from '../../../shared/models/base-response.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserQueried } from '../models/user-query.model';
import { UserRoleQueried } from '../models/user-roles-query.model';
import { UserGroupQueried } from '../models/user-group-query.model';
import { UserDetailQueried } from '../models/user-detail-query.model';
import { UserPersonalityQueried } from '../models/user-personality-query.model';
import { map } from 'rxjs/internal/operators/map';
import { StorageService } from '../../../core/services/storage.service';
import { SystemStorageKey } from '../../../core/enums/system-storage.enum';
import { UpdateUserInfo } from '../models/update-user-request.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

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

  /**
   * 取得該使用者資料
   *  @param username
   */
  public getPersonality() {
    const username =
      this.storageService.getSessionStorageItem(SystemStorageKey.USERNAME) ||
      this.storageService.getLocalStorageItem(SystemStorageKey.USERNAME);
    const url = this.baseApiUrl + '/users/' + username + '/details';

    if (environment.apiMock) {
      return this.http.get<UserDetailQueried>('/user-data.json').pipe(
        map((response) => {
          return response;
        })
      );
    }
    return this.http.get<UserDetailQueried>(url).pipe(
      map((response) => {
        return response;
      })
    );
  }

  /**
   * 更新使用者資料
   */
  public update(id: Number, request: UpdateUserInfo): Observable<any> {
    const url = this.baseApiUrl + '/users/' + id;
    return this.http.put(url, request);
  }

  
}
