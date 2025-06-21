import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { BaseResponse } from '../../../shared/models/base-response.model';
import { FunctionQueried } from '../models/function-query.model';
import { SaveFunction } from '../models/save-functions-request.model';

@Injectable({
  providedIn: 'root',
})
export class FunctionsService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 查詢功能資料
   * @param dataType
   * @param type
   * @param name
   * @param activeFlag
   */
  query(
    service: string,
    type: string,
    name?: string,
    activeFlag?: string,
    actionType?: string
  ): Observable<FunctionQueried[]> {
    const url = this.baseApiUrl + '/functions/query';
    let params = new HttpParams()
      .set('service', service ? service : '')
      .set('actionType', actionType ? actionType : '')
      .set('type', type ? type : '')
      .set('name', name ? name : '')
      .set('activeFlag', activeFlag ? activeFlag : '');
    return this.http.get<FunctionQueried[]>(url, { params });
  }

  /**
   * 提交更新或新增功能資料
   * @param requestData
   */
  submit(requestData: SaveFunction[]): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/functions/saveList';
    return this.http.post<BaseResponse>(url, requestData);
  }

  /**
   * 刪除多筆功能資料
   * @param ids
   * @returns
   */
  delete(ids: number[]): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/functions';
    return this.http.delete<BaseResponse>(url, { body: ids });
  }
}
