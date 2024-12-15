import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FunctionQueried } from '../../features/functions/models/function-query.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private readonly baseApiUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  // /**
  //  * 查詢角色功能
  //  * @param queryStr
  //  * @returns
  //  */
  // query(): Observable<FunctionQueried[]> {
  //   const url = this.baseApiUrl + '/functions/query';
  //   return this.http.get<FunctionQueried[]>(url);
  // }
}
