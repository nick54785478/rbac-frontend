export interface PageableResponse {
  page: Page;
  content: any[];
}

export interface Page {
  /***
   * 總頁數
   */
  totalPages: number;

  /**
   * 符合查詢條件的數據總數
   */
  totalElements: number;
  /**
   * 每頁的數據量（分頁大小）
   */
  size: number;
  /**
   * 當前頁碼（從 0 開始）
   */
  number: number;
  /**
   * 當前頁實際返回的數據數量
   */
  numberOfElements: number;
  /**
   * 是否為最後一頁
   */
  last: boolean;
  /**
   * 是否為第一頁
   */
  first: boolean;
  /**
   * 當前頁是否沒有數據
   */
  empty: boolean;
}
