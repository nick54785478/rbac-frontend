import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigateService {
  constructor(private router: Router) {}

  /**
   * 進行重導向
   * @param url
   */
  navigate(url: string) {
    this.router.navigateByUrl(url);
  }

  /**
   * 透過參數進行重導向
   * @param redirectUrl
   * @param queryParams
   */
  navigateWitgQueryParam(redirectUrl: string, queryParams: string) {
    this.router.navigate([redirectUrl], {
      queryParams: JSON.parse(queryParams),
    });
  }
}
