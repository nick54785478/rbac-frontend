import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Option } from '../models/option.model';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { environment } from '../../../environments/environment';
import { userInfo } from 'os';
import { UserInfoOption } from '../models/userinfo-option.model';
import { RoleInfoOption } from '../models/role-info-option.model';
import { GroupInfoOption } from '../models/group-info-option.model';

@Injectable({
  providedIn: 'root',
})
export class OptionService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 取得 Data Type 配置資料
   * @return Observable<MenuItem[]
   */
  public getDataTypes(): Observable<Option[]> {
    return this.http.get<Option[]>('/data-type.json').pipe(
      map((response) => {
        return response;
      })
    );
  }

  // /**
  //  * 取得 Service 配置資料
  //  * @return Observable<MenuItem[]
  //  */
  // public getServiceList(): Observable<Option[]> {
  //   return this.http.get<Option[]>('/services.json').pipe(
  //     map((response) => {
  //       return response;
  //     })
  //   );
  // }

  /**
   * 取得 Setting Type 種類
   * @param type
   * @return  Observable<Option[]>
   */
  public getSettingTypes(service: string, type: string): Observable<Option[]> {
    const url = this.baseApiUrl + '/options/query';
    let params = new HttpParams()
      .set('type', type ? type : '')
      .set('service', service ? service : '');
    return this.http.get<Option[]>(url, { params }).pipe(
      map((response) => {
        return response;
      })
    );
  }

  /**
   * 取得 UserInfo AutoComplete 資料
   * @param queryStr
   * @returns
   */
  public getUserOptions(queryStr: string): Observable<UserInfoOption[]> {
    const url = this.baseApiUrl + '/options/getUserOptions';
    let params = new HttpParams().set('queryStr', queryStr ? queryStr : '');
    return this.http.get<UserInfoOption[]>(url, { params }).pipe(
      map((response) => {
        return response;
      })
    );
  }

  /**
   * 取得 RoleInfo AutoComplete 資料
   * @param queryStr
   * @returns
   */
  public getRoleOptions(
    service: string,
    queryStr: string
  ): Observable<RoleInfoOption[]> {
    const url = this.baseApiUrl + '/options/roles';
    let params = new HttpParams()
      .set('service', service ? service : '')
      .set('queryStr', queryStr ? queryStr : '');
    return this.http.get<RoleInfoOption[]>(url, { params }).pipe(
      map((response) => {
        return response;
      })
    );
  }

  /**
   * 取得 RoleInfo AutoComplete 資料
   * @param queryStr
   * @returns
   */
  public getGroupOptions(
    service: string,
    queryStr: string
  ): Observable<GroupInfoOption[]> {
    const url = this.baseApiUrl + '/options/groups';
    let params = new HttpParams()
      .set('service', service ? service : '')
      .set('queryStr', queryStr ? queryStr : '');
    return this.http.get<GroupInfoOption[]>(url, { params }).pipe(
      map((response) => {
        return response;
      })
    );
  }
}
