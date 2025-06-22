import { Injectable, OnDestroy } from '@angular/core';
import { StorageService } from './storage.service';
import { SystemStorageKey } from '../enums/system-storage.enum';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs/internal/observable/of';
import { BehaviorSubject, Subject } from 'rxjs';
import { RefreshTokenResponse } from '../models/refresh-token.response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseApiUrl = environment.apiEndpoint;
  private readonly serviceHeader = environment.serviceHeader;

  tokenSubject$ = new BehaviorSubject<string>('');

  constructor(
    private storageService: StorageService,
    private http: HttpClient
  ) {}

  /**
   * 取得 JwtToken
   * @returns token
   */
  getJwtToken(): Observable<any> {
    const token =
      this.storageService.getLocalStorageItem(SystemStorageKey.JWT_TOKEN) ||
      this.storageService.getSessionStorageItem(SystemStorageKey.JWT_TOKEN);
    return of(token);
  }

  /**
   * 刷新 Token
   * */
  refreshToken(refreshToken: string): Observable<RefreshTokenResponse> {
    const url = this.baseApiUrl + '/refresh';
    // 加入 Service Header 請求頭
    const headers = new HttpHeaders({
      service: this.serviceHeader,
    });
    const request = { token: refreshToken };
    return this.http.post<RefreshTokenResponse>(url, { headers, request });
  }

  /**
   * 確定是否已登入
   * @param token
   * @returns boolean
   */
  isAuthenticated(token: string): boolean {
    if (token || token) {
      return true;
    }
    return false;
  }

  /**
   * 清除 Token
   */
  clearToken() {
    this.storageService.removeLocalStorageItem(SystemStorageKey.JWT_TOKEN);
    this.storageService.removeSessionStorageItem(SystemStorageKey.JWT_TOKEN);
  }

  /**
   * 檢測 Token 是否過期
   * @param token
   * @returns boolean
   */
  checkExpired(token: string): boolean {
    if (!token) {
      return true;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // 解碼 payload
      const currentTime = Math.floor(Date.now() / 1000); // 當前時間（秒）
      return payload.exp < currentTime; // 是否過期
    } catch (error) {
      console.error('Invalid token:', error);
      return true; // 如果無法解析，視為過期
    }
  }
}
