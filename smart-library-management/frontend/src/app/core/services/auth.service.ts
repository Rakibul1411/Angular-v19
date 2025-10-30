import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { CreateUserDto, UserRole } from '../models/user.model';
import {
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse
} from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/users`;

  private currentUserSignal = signal<LoginResponse['user'] | null>(null);

  currentUser = this.currentUserSignal.asReadonly();
  isLoggedIn = computed(() => !!this.currentUserSignal());
  isAdmin = computed(() => this.currentUserSignal()?.role === UserRole.ADMIN);
  isStudent = computed(() => this.currentUserSignal()?.role === UserRole.STUDENT);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = this.storage.getUserData();
    if (user) {
      this.currentUserSignal.set(user);
    }
  }

  register(userData: CreateUserDto): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.storage.setAccessToken(response.accessToken);
          this.storage.setRefreshToken(response.refreshToken);
          this.storage.setUserData(response.user);
          this.currentUserSignal.set(response.user);
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.storage.getRefreshToken();
    console.log('🔑 Attempting to refresh token...', { hasRefreshToken: !!refreshToken });

    if (!refreshToken) {
      console.error('❌ No refresh token available');
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, request)
      .pipe(
        tap(response => {
          console.log('✅ Token refresh successful', {
            hasAccessToken: !!response.accessToken,
            hasRefreshToken: !!response.refreshToken,
            user: response.user?.email
          });
          this.storage.setAccessToken(response.accessToken);
          this.storage.setRefreshToken(response.refreshToken);
          this.storage.setUserData(response.user);
          this.currentUserSignal.set(response.user);
        }),
        catchError(error => {
          console.error('❌ Token refresh error:', {
            status: error.status,
            message: error.error?.error || error.message
          });
          // Don't logout here, let the interceptor handle it
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<LogoutResponse | void> {
    const refreshToken = this.storage.getRefreshToken();

    if (refreshToken) {
      const request: LogoutRequest = { refreshToken };
      return this.http.post<LogoutResponse>(`${this.apiUrl}/logout`, request).pipe(
        tap(() => {
          this.clearSession();
        }),
        catchError(error => {
          this.clearSession();
          return throwError(() => error);
        })
      );
    } else {
      this.clearSession();
      return new Observable(observer => {
        observer.next();
        observer.complete();
      });
    }
  }

  private clearSession(): void {
    this.storage.clearAll();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  clearSessionAndRedirect(): void {
    this.storage.clearAll();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  // Helper methods
  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserSignal()?.role === role;
  }
}
