export interface SuccessErrorData {
  batchId: string | null;
  error: string | null;
  checkErrors: CheckError[] | null;
}

export interface CheckError {
  code: string;
  message: string;
}
