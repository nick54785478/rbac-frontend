import { Injectable } from '@angular/core';
import { RoleFunctionQueried } from '../models/role-function-query.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { UpdateRoleFunction } from '../models/update-role-function-request.model copy';
import { BaseResponse } from '../../../shared/models/base-response.model';

@Injectable({
  providedIn: 'root',
})
export class RoleFunctionsService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 透過 ID 查詢角色資料
   * @param id
   */
  queryOthers(id: number): Observable<RoleFunctionQueried[]> {
    const url = this.baseApiUrl + '/roles/functions/' + id + '/others';
    return this.http.get<RoleFunctionQueried[]>(url);
  }

  /**
   * 提交更新或新增角色資料
   * @param requestData
   */
  update(requestData: UpdateRoleFunction): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/roles/functions/update';
    return this.http.post<BaseResponse>(url, requestData);
  }
}
