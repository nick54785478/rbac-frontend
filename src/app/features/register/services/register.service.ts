import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { RegisterUser } from '../models/register-user-request.model';
import { BaseResponse } from '../../../shared/models/base-response.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
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
}
