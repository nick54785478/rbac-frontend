import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { RoleQueried } from '../models/role-query.model';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SaveRole } from '../models/save-role-request.model';
import { BaseResponse } from '../../../shared/models/base-response.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 查詢角色資料
   * @param dataType
   * @param type
   * @param name
   * @param activeFlag
   */
  query(
    service: string,
    type: string,
    name?: string,
    activeFlag?: string
  ): Observable<RoleQueried[]> {
    const url = this.baseApiUrl + '/roles/query';
    let params = new HttpParams()
      .set('service', service ? service : '')
      .set('type', type ? type : '')
      .set('name', name ? name : '')
      .set('activeFlag', activeFlag ? activeFlag : '');
    return this.http.get<RoleQueried[]>(url, { params });
  }

  /**
   * 透過 ID 查詢角色資料
   * @param id
   */
  queryById(id: number): Observable<RoleQueried> {
    const url = this.baseApiUrl + '/roles' + '/' + id;
    return this.http.get<RoleQueried>(url);
  }

  /**
   * 提交更新或新增角色資料
   * @param requestData
   */
  submit(requestData: SaveRole[]): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/roles/saveList';
    return this.http.post<BaseResponse>(url, requestData);
  }

  /**
   * 刪除多筆角色資料
   * @param ids
   * @returns
   */
  delete(ids: number[]): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/roles';
    return this.http.delete<BaseResponse>(url, { body: ids });
  }
}
