import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
        console.error('Client-side error:', error.error.message);
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || error.error?.error || 'Bad Request - Invalid data provided';
            console.error('Bad Request (400):', errorMessage);
            break;

          case 401:
            // Skip 401 - handled by auth interceptor for token refresh
            // Only log if it's not a token refresh endpoint
            if (!req.url.includes('/refresh')) {
              console.warn('Unauthorized (401) - Token may be expired');
            }
            break;

          case 403:
            errorMessage = 'Access Denied - You do not have permission to access this resource';
            console.error('Forbidden (403):', errorMessage);
            router.navigate(['/unauthorized']);
            break;

          case 404:
            errorMessage = error.error?.message || 'Resource not found';
            console.error('Not Found (404):', error.url);
            break;

          case 409:
            errorMessage = error.error?.message || error.error?.error || 'Conflict - Resource already exists';
            console.error('Conflict (409):', errorMessage);
            break;

          case 422:
            errorMessage = error.error?.message || error.error?.error || 'Validation Error - Please check your input';
            console.error('Unprocessable Entity (422):', errorMessage);
            break;

          case 429:
            errorMessage = 'Too Many Requests - Please try again later';
            console.error('Rate Limited (429)');
            break;

          case 500:
            errorMessage = 'Internal Server Error - Please try again later';
            console.error('Server Error (500):', error.message);
            break;

          case 502:
            errorMessage = 'Bad Gateway - Server is temporarily unavailable';
            console.error('Bad Gateway (502)');
            break;

          case 503:
            errorMessage = 'Service Unavailable - Please try again later';
            console.error('Service Unavailable (503)');
            break;

          case 504:
            errorMessage = 'Gateway Timeout - Request took too long';
            console.error('Gateway Timeout (504)');
            break;

          case 0:
            errorMessage = 'Network Error - Please check your internet connection';
            console.error('Network Error (0) - Could not connect to server');
            break;

          default:
            errorMessage = error.error?.message || error.error?.error || `Server Error (${error.status})`;
            console.error(`HTTP Error (${error.status}):`, errorMessage);
        }
      }

      // Log detailed error information in development
      if (!error.url?.includes('/refresh')) {
        console.error('Full error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: errorMessage,
          error: error.error
        });
      }

      // Return error with user-friendly message
      return throwError(() => ({
        ...error,
        userMessage: errorMessage
      }));
    })
  );
};
