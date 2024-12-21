import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { UserQueried } from '../../users/models/user-query.model';
import { UserPersonalityQueried } from '../../users/models/user-personality-query.model';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  constructor(private http: HttpClient) {}

  // 使用 BehaviorSubject 儲存 SideBar 的顯示狀態，初始值為 false (隱藏)
  private sidebarVisibleSubject = new BehaviorSubject<boolean>(true);

  /**
   * 取得側邊超連結資料
   * @return Observable<MenuItem[]
   */
  public getPermissions(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>('/permission.json').pipe(
      map((response) => {
        return response;
      })
    );
  }
}
