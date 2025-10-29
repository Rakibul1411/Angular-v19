import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UpdateUserDto, UsersListResponse, UpdateUserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private readonly RETRY_COUNT = 1;
  private readonly ERROR_MESSAGES = {
    FETCH_USER: 'Failed to fetch user details',
    FETCH_USERS: 'Failed to fetch users list',
    UPDATE_USER: 'Failed to update user',
    NETWORK_ERROR: 'Network error occurred. Please check your connection.'
  } as const;


  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_USER))
    );
  }


  updateUser(id: string, userData: UpdateUserDto): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(`${this.apiUrl}/${id}`, userData).pipe(
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.UPDATE_USER))
    );
  }


  getAllUsers(): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(`${this.apiUrl}/all`).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_USERS))
    );
  }


  getUsersByRole(role: 'admin' | 'student'): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(`${this.apiUrl}/role`, {
      params: { role }
    }).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_USERS))
    );
  }


  private handleError(error: HttpErrorResponse, customMessage: string): Observable<never> {
    let errorMessage = customMessage;

    if (error.error instanceof ErrorEvent) {
      errorMessage = this.ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = this.ERROR_MESSAGES.NETWORK_ERROR;
    }

    console.error('UserService Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
