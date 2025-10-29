import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Book, CreateBookDto, UpdateBookDto } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/books`;

  private readonly RETRY_COUNT = 1;
  private readonly ERROR_MESSAGES = {
    FETCH_BOOK: 'Failed to fetch book details',
    FETCH_BOOKS: 'Failed to fetch books list',
    CREATE_BOOK: 'Failed to create book',
    UPDATE_BOOK: 'Failed to update book',
    DELETE_BOOK: 'Failed to delete book',
    SEARCH_BOOKS: 'Failed to search books',
    NETWORK_ERROR: 'Network error occurred. Please check your connection.'
  } as const;


  getAllBooks(): Observable<{ data: Book[]; count: number }> {
    return this.http.get<{ data: Book[]; count: number }>(`${this.apiUrl}/all`).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_BOOKS))
    );
  }


  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_BOOK))
    );
  }


  createBook(bookData: CreateBookDto): Observable<Book> {
    // Set available_copies to copies for new books
    const payload = {
      ...bookData,
      available_copies: bookData.copies
    };

    return this.http.post<Book>(`${this.apiUrl}/addBook`, payload).pipe(
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.CREATE_BOOK))
    );
  }


  updateBook(id: string, bookData: UpdateBookDto): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, bookData).pipe(
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.UPDATE_BOOK))
    );
  }


  deleteBook(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.DELETE_BOOK))
    );
  }


  searchBooks(search?: string, title?: string, author?: string): Observable<Book[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (title) params = params.set('title', title);
    if (author) params = params.set('author', author);

    return this.http.get<Book[]>(`${this.apiUrl}/getBooks`, { params }).pipe(
      retry(this.RETRY_COUNT),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.SEARCH_BOOKS))
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

    console.error('BookService Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
