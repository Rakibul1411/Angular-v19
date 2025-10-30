import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

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
      if (error.status === 401 && storage.getRefreshToken() && !req.url.includes('/refresh')) {
        console.log('🔄 Access token expired (401), attempting refresh...');

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          // Attempt to refresh the token
          return authService.refreshToken().pipe(
            switchMap((response) => {
              isRefreshing = false;
              const newToken = storage.getAccessToken();
              refreshTokenSubject.next(newToken);

              console.log('✅ Token refreshed successfully, retrying original request...');

              // Retry the original request with new token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              console.error('❌ Token refresh failed:', refreshError);

              // Only logout if refresh token is also invalid (401/403)
              if (refreshError.status === 401 || refreshError.status === 403) {
                console.log('🚪 Refresh token invalid, logging out...');
                authService.clearSessionAndRedirect();
              }
              return throwError(() => refreshError);
            })
          );
        } else {
          console.log('⏳ Token refresh already in progress, queuing request...');
          // If already refreshing, wait for the new token
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
              console.log('✅ Got new token from queue, retrying queued request...');
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next(retryReq);
            })
          );
        }
      }

      // Handle 403 Forbidden - actual permission denied (not token issue)
      if (error.status === 403) {
        console.warn('🚫 Access forbidden (403) - insufficient permissions');
        // Let the error interceptor handle the redirect to unauthorized page
      }

      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
};
