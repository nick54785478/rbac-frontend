import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { JwtToken } from '../models/jwt-token.model';
import { Observable } from 'rxjs/internal/Observable';
import { url } from 'inspector';
import { Login } from '../models/login-request.model';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly baseApiUrl = environment.apiEndpoint;
  private readonly serviceHeader = environment.serviceHeader;

  constructor(private http: HttpClient) {}

  /**
   * 使用者登入
   * @param request
   * @returns JwtToken
   */
  login(request: Login): Observable<any> {
    const url = this.baseApiUrl + '/login';

    // 加入 Service Header 請求頭
    const headers = new HttpHeaders({
      'service-header': this.serviceHeader,
    });

    return this.http.post<JwtToken>(url, request, { headers: headers });
  }

  /**
   * 取得使用者資料
   * @param username
   * @returns Observable<UserProfile>
   */
  getUserInfo(username: string): Observable<UserProfile> {
    const url = this.baseApiUrl + '/users/' + username;
    return this.http.get<UserProfile>(url);
  }
}
