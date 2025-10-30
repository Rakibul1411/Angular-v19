import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  UpdateUserDto,
  UsersListResponse,
  UpdateUserResponse,
  DeleteUserResponse,
  UserRole
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch user'))
    );
  }

  updateUser(id: string, userData: UpdateUserDto): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(`${this.apiUrl}/${id}`, userData).pipe(
      catchError((error) => this.handleError(error, 'Failed to update user'))
    );
  }

  getAllUsers(): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(`${this.apiUrl}/all`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch users'))
    );
  }

  getUsersByRole(role: UserRole): Observable<UsersListResponse> {
    return this.http.get<UsersListResponse>(`${this.apiUrl}/role`, {
      params: { role }
    }).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch users'))
    );
  }

  deleteUser(id: string): Observable<DeleteUserResponse> {
    return this.http.delete<DeleteUserResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => this.handleError(error, 'Failed to delete user'))
    );
  }

  private handleError(error: HttpErrorResponse, customMessage: string): Observable<never> {
    const errorMessage = error.error?.error || error.error?.message || customMessage;
    console.error('UserService Error:', error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
