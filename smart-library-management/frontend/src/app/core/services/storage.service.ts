import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly ACCESS_TOKEN = 'access_token';
  private readonly REFRESH_TOKEN = 'refresh_token';
  private readonly USER_DATA = 'user_data';

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  setUserData(user: any): void {
    localStorage.setItem(this.USER_DATA, JSON.stringify(user));
  }

  getUserData(): any {
    try {
      const data = localStorage.getItem(this.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      return null;
    }
  }

  clearAll(): void {
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    localStorage.removeItem(this.USER_DATA);
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }
}
