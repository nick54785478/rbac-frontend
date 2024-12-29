import { HttpInterceptorFn } from '@angular/common/http';

/**
 * //TODO
 * JwToken 攔截器
 * @param req
 * @param next
 * @returns
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
