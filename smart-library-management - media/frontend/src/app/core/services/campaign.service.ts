import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Campaign, CampaignListResponse, CampaignResponse } from '../models/campaign.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/campaigns`;

  getAllCampaigns(): Observable<CampaignListResponse> {
    return this.http.get<CampaignListResponse>(`${this.apiUrl}/allCampaigns`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch campaigns'))
    );
  }

  getCampaignById(id: string): Observable<CampaignResponse> {
    return this.http.get<CampaignResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch campaign'))
    );
  }

  private handleError(error: HttpErrorResponse, customMessage: string): Observable<never> {
    const errorMessage = error.error?.error || error.error?.message || customMessage;
    console.error('CampaignService Error:', error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
