import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const token = storage.getAccessToken();

  // Skip auth header for public endpoints
  if (req.url.includes('/login') ||
      req.url.includes('/register') ||
      req.url.includes('/refresh')) {
    return next(req);
  }

  // Clone request with authorization header if token exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  // Handle the request and catch 401 errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle token expiration (401 Unauthorized)
      if (error.status === 401 && storage.getRefreshToken()) {
        // Attempt to refresh the token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Get the new token and retry the original request
            const newToken = storage.getAccessToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, logout the user
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }

      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
};
