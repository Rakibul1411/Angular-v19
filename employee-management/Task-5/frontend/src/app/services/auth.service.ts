import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getSavedUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.auth.apiUrl, credentials).pipe(
      tap(response => {
        this.saveAuthData(response);
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(environment.auth.tokenKey);
    localStorage.removeItem(environment.auth.userKey);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.auth.tokenKey);
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token; // For now, just check if token exists
  }

  private saveAuthData(response: LoginResponse): void {
    localStorage.setItem(environment.auth.tokenKey, response.accessToken);
    localStorage.setItem(environment.auth.userKey, JSON.stringify(response));
  }

  private getSavedUser(): LoginResponse | null {
    const userStr = localStorage.getItem(environment.auth.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }
}
