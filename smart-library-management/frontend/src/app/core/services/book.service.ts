import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Book, CreateBookDto, UpdateBookDto, BooksListResponse, DeleteBookResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/books`;

  getAllBooks(): Observable<BooksListResponse> {
    return this.http.get<BooksListResponse>(`${this.apiUrl}/all`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch books'))
    );
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to fetch book'))
    );
  }

  createBook(bookData: CreateBookDto): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/addBook`, bookData).pipe(
      catchError((error) => this.handleError(error, 'Failed to create book'))
    );
  }

  updateBook(id: string, bookData: UpdateBookDto): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, bookData).pipe(
      catchError((error) => this.handleError(error, 'Failed to update book'))
    );
  }

  deleteBook(id: string): Observable<DeleteBookResponse> {
    return this.http.delete<DeleteBookResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => this.handleError(error, 'Failed to delete book'))
    );
  }

  searchBooks(search?: string, title?: string, author?: string): Observable<Book[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (title) params = params.set('title', title);
    if (author) params = params.set('author', author);

    return this.http.get<Book[]>(`${this.apiUrl}/getBooks`, { params }).pipe(
      retry(1),
      catchError((error) => this.handleError(error, 'Failed to search books'))
    );
  }


  private handleError(error: HttpErrorResponse, customMessage: string): Observable<never> {
    const errorMessage = error.error?.error || error.error?.message || customMessage;
    console.error('BookService Error:', error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
