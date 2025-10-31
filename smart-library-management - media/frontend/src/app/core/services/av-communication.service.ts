import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AVCommunication,
  AVCommunicationListResponse,
  AVCommunicationResponse,
  DeleteAVCommunicationResponse,
  CreateAVCommunicationDto,
  UpdateAVCommunicationDto,
  AVCommunicationFilter
} from '../models/av-communication.model';

@Injectable({
  providedIn: 'root'
})
export class AVCommunicationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/communications`;

  /**
   * Get all AV Communications with optional filters
   */
  getAllAVCommunications(filter?: AVCommunicationFilter): Observable<AVCommunicationListResponse> {
    let params = new HttpParams();

    if (filter) {
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.limit) params = params.set('limit', filter.limit.toString());
    }

    return this.http.get<AVCommunicationListResponse>(`${this.apiUrl}/allCommunications`, { params }).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch AV Communications'))
    );
  }

  /**
   * Get a single AV Communication by ID
   */
  getAVCommunicationById(id: string): Observable<AVCommunicationResponse> {
    return this.http.get<AVCommunicationResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch AV Communication'))
    );
  }

  /**
   * Create a new AV Communication
   */
  createAVCommunication(data: CreateAVCommunicationDto): Observable<AVCommunicationResponse> {
    const formData = new FormData();
    if (data.type) {
      formData.append('type', data.type);
    }
    formData.append('campaign', data.campaign);
    formData.append('brand', data.brand);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('file', data.file);

    return this.http.post<AVCommunicationResponse>(`${this.apiUrl}/createCommunication`, formData).pipe(
      catchError((error) => this.handleError(error, 'Failed to create AV Communication'))
    );
  }

  /**
   * Update an existing AV Communication
   */
  updateAVCommunication(id: string, data: UpdateAVCommunicationDto): Observable<AVCommunicationResponse> {
    const formData = new FormData();

    if (data.type) formData.append('type', data.type);
    if (data.campaign) formData.append('campaign', data.campaign);
    if (data.brand) formData.append('brand', data.brand);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.file) formData.append('file', data.file);

    return this.http.put<AVCommunicationResponse>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError((error) => this.handleError(error, 'Failed to update AV Communication'))
    );
  }

  /**
   * Delete an AV Communication
   */
  deleteAVCommunication(id: string): Observable<DeleteAVCommunicationResponse> {
    return this.http.delete<DeleteAVCommunicationResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => this.handleError(error, 'Failed to delete AV Communication'))
    );
  }

  /**
   * Get file URL for preview/download
   */
  getFileUrl(filePath: string): string {
    // Remove leading slash if present and construct full URL
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    return `${environment.apiUrl.replace('/api', '')}/${cleanPath}`;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse, customMessage: string): Observable<never> {
    const errorMessage = error.error?.error || error.error?.message || customMessage;
    console.error('AVCommunicationService Error:', error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
