import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { FieldView } from '../models/field-view.model';
import { map } from 'rxjs/internal/operators/map';
import { BaseResponse } from '../models/base-response.model';
import { UpdateCustomisation } from '../models/update-customisation-request.model';

@Injectable({
  providedIn: 'root',
})
export class CustomisationService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  /**
   * 取得 Data Type 配置資料
   * @param username 使用者名稱
   * @param component Component 名稱
   * @param type 配置種類
   * @return Observable<FieldView[]>
   */
  public getFieldViewCustomisations(
    username: string,
    component: string
  ): Observable<FieldView[]> {
    const url = this.baseApiUrl + '/customisation/fieldView';
    let params = new HttpParams()
      .set('username', username ? username : '')
      .set('component', component ? component : '');
    return this.http.get<FieldView[]>(url, { params }).pipe(
      map((response) => {
        return response;
        // return response.map((data) => data.field);
      })
    );
  }

  /**
   * 更新個人化設定
   * @param requestData
   * @returns
   */
  public updateCustomisation(
    requestData: UpdateCustomisation
  ): Observable<BaseResponse> {
    const url = this.baseApiUrl + '/customisation';
    return this.http.post<BaseResponse>(url, requestData).pipe(
      map((response) => {
        return response;
      })
    );
  }
}
