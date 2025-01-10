export interface PageableResponse {
  page: Page;
  content: any[];
}

export interface Page {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}
