import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  UpdateUserDto,
  UsersListResponse,
  UpdateUserResponse
} from '../models/user.model';

/**
 * Service for managing user-related operations
 * Handles CRUD operations for users with proper error handling
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  // Configuration constants
  private readonly RETRY_COUNT = 1;
  private readonly ERROR_MESSAGES = {
    FETCH_USER: 'Failed to fetch user details',
    FETCH_USERS: 'Failed to fetch users list',
    UPDATE_USER: 'Failed to update user',
    DELETE_USER: 'Failed to delete user',
    NETWORK_ERROR: 'Network error occurred. Please check your connection.'
  } as const;

  /**
   * Get user by ID
   * @param id User ID
   * @returns Observable of User
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_USER))
    );
  }

  /**
   * Update user information
   * @param id User ID
   * @param userData Updated user data
   * @returns Observable of UpdateUserResponse
   */
  updateUser(id: string, userData: UpdateUserDto): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(`${this.apiUrl}/${id}`, userData).pipe(
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.UPDATE_USER))
    );
  }

  /**
   * Get all users
   * @returns Observable of UsersListResponse
   */
  getAllUsers(): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(`${this.apiUrl}/all`).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_USERS))
    );
  }

  /**
   * Get users by role
   * @param role User role (admin or student)
   * @returns Observable of UsersListResponse
   */
  getUsersByRole(role: 'admin' | 'student'): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(`${this.apiUrl}/role`, {
      params: { role }
    }).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_USERS))
    );
  }

  /**
   * Delete user by ID
   * @param id User ID
   * @returns Observable with success message
   */
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.DELETE_USER))
    );
  }

  /**
   * Handle HTTP errors
   * @param error HTTP error response
   * @param customMessage Custom error message
   * @returns Observable that errors with formatted message
   */
  private handleError(error: HttpErrorResponse, customMessage: string): Observable<never> {
    let errorMessage = customMessage;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = this.ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.error?.message) {
      // Backend error with message
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      // Network error
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
