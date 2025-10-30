import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Brand, BrandListResponse, BrandResponse } from '../models/brand.model';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/brands`;

  getAllBrands(): Observable<BrandListResponse> {
    return this.http.get<BrandListResponse>(`${this.apiUrl}/allBrands`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch brands'))
    );
  }

  getBrandById(id: string): Observable<BrandResponse> {
    return this.http.get<BrandResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch brand'))
    );
  }

  private handleError(error: HttpErrorResponse, customMessage: string): Observable<never> {
    const errorMessage = error.error?.error || error.error?.message || customMessage;
    console.error('BrandService Error:', error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
