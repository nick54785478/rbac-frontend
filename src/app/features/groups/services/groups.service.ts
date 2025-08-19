import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { BaseResponse } from '../../../shared/models/base-response.model';
import { GroupQueried } from '../models/group-query.model';
import { SaveGroup } from '../models/save-groups-request.model';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 查詢群組資料
   * @param dataType
   * @param type
   * @param name
   * @param activeFlag
   */
  query(
    service?: string,
    type?: string,
    name?: string,
    activeFlag?: string
  ): Observable<GroupQueried[]> {
    const url = this.baseApiUrl + '/groups/query';
    let params = new HttpParams()
      .set('service', service ? service : '')
      .set('type', type ? type : '')
      .set('name', name ? name : '')
      .set('activeFlag', activeFlag ? activeFlag : '');
    return this.http.get<GroupQueried[]>(url, { params });
  }

  /**
   * 提交更新或新增群組資料
   * @param requestData
   */
  submit(requestData: SaveGroup[]): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/groups/saveList';
    return this.http.post<BaseResponse>(url, requestData);
  }

  /**
   * 刪除多筆群組資料
   * @param ids
   * @returns
   */
  delete(ids: number[]): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/groups';
    return this.http.delete<BaseResponse>(url, { body: ids });
  }

  /**
   * 透過 ID 查詢角色資料
   * @param id
   */
  queryByIdAndService(id: number, service: string): Observable<GroupQueried> {
    const url = this.baseApiUrl + '/groups' + '/' + id;
    let params = new HttpParams().set('service', service ? service : '');
    return this.http.get<GroupQueried>(url, { params });
  }
}
