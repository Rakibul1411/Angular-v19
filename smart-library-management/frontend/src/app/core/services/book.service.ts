import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Book,
  CreateBookDto,
  UpdateBookDto,
  BooksListResponse,
  BookResponse,
  DeleteBookResponse
} from '../models/book.model';

/**
 * Service for managing book-related operations
 * Handles CRUD operations, search, and data transformation between frontend and backend formats
 */
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/books`;

  // Configuration constants
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

  /**
   * Transform backend book format to frontend format
   * Handles the conversion between snake_case (backend) and camelCase (frontend)
   */
  private transformBook(book: any): Book {
    return {
      ...book,
      totalCopies: book.copies ?? book.totalCopies ?? 0,
      availableCopies: book.available_copies ?? book.availableCopies ?? 0
    };
  }

  /**
   * Transform frontend book format to backend format
   * Converts camelCase to snake_case for backend API
   */
  private transformToBackend(bookData: CreateBookDto | UpdateBookDto): any {
    const backendData: any = {};

    if ('title' in bookData && bookData.title) backendData.title = bookData.title;
    if ('author' in bookData && bookData.author) backendData.author = bookData.author;
    if ('isbn' in bookData && bookData.isbn) backendData.isbn = bookData.isbn;
    if ('publisher' in bookData && bookData.publisher) backendData.publisher = bookData.publisher;
    if ('publishedYear' in bookData && bookData.publishedYear) backendData.publishedYear = bookData.publishedYear;
    if ('category' in bookData && bookData.category) backendData.category = bookData.category;
    if ('description' in bookData && bookData.description) backendData.description = bookData.description;
    if ('shelfLocation' in bookData && bookData.shelfLocation) backendData.shelfLocation = bookData.shelfLocation;
    if ('coverImage' in bookData && bookData.coverImage) backendData.coverImage = bookData.coverImage;

    if ('totalCopies' in bookData && bookData.totalCopies !== undefined) {
      backendData.copies = bookData.totalCopies;
    }
    if ('availableCopies' in bookData && bookData.availableCopies !== undefined) {
      backendData.available_copies = bookData.availableCopies;
    }

    return backendData;
  }

  /**
   * Get all books
   * @returns Observable of BooksListResponse
   */
  getAllBooks(): Observable<BooksListResponse> {
    return this.http.get<any>(`${this.apiUrl}/all`).pipe(
      retry(this.RETRY_COUNT),
      map(response => ({
        success: true,
        data: (response.data || []).map((book: any) => this.transformBook(book))
      })),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_BOOKS))
    );
  }

  /**
   * Get book by ID
   * @param id Book ID
   * @returns Observable of BookResponse
   */
  getBookById(id: string): Observable<BookResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      retry(this.RETRY_COUNT),
      map(book => ({
        success: true,
        data: this.transformBook(book)
      })),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_BOOK))
    );
  }

  /**
   * Create new book (Admin only)
   * @param bookData Book data to create
   * @returns Observable of BookResponse
   */
  createBook(bookData: CreateBookDto): Observable<BookResponse> {
    const backendData = this.transformToBackend(bookData);
    // New books have all copies available initially
    backendData.available_copies = backendData.copies;

    return this.http.post<any>(`${this.apiUrl}/addBook`, backendData).pipe(
      map(book => ({
        success: true,
        data: this.transformBook(book)
      })),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.CREATE_BOOK))
    );
  }

  /**
   * Update book (Admin only)
   * @param id Book ID
   * @param bookData Updated book data
   * @returns Observable of BookResponse
   */
  updateBook(id: string, bookData: UpdateBookDto): Observable<BookResponse> {
    const backendData = this.transformToBackend(bookData);

    return this.http.put<any>(`${this.apiUrl}/${id}`, backendData).pipe(
      map(book => ({
        success: true,
        data: this.transformBook(book)
      })),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.UPDATE_BOOK))
    );
  }

  /**
   * Delete book (Admin only)
   * @param id Book ID
   * @returns Observable of DeleteBookResponse
   */
  deleteBook(id: string): Observable<DeleteBookResponse> {
    return this.http.delete<DeleteBookResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.DELETE_BOOK))
    );
  }

  /**
   * Search books by query
   * @param query Search query string
   * @returns Observable of BooksListResponse
   */
  searchBooks(query: string): Observable<BooksListResponse> {
    const params = new HttpParams().set('search', query);
    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      retry(this.RETRY_COUNT),
      map(response => ({
        success: true,
        data: (response.data || []).map((book: any) => this.transformBook(book))
      })),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.SEARCH_BOOKS))
    );
  }

  /**
   * Get books by category
   * @param category Book category
   * @returns Observable of BooksListResponse
   */
  getBooksByCategory(category: string): Observable<BooksListResponse> {
    const params = new HttpParams().set('category', category);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      retry(this.RETRY_COUNT),
      map(response => ({
        success: true,
        data: (response.data || []).map((book: any) => this.transformBook(book))
      })),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_BOOKS))
    );
  }

  /**
   * Get available books only
   * @returns Observable of BooksListResponse
   */
  getAvailableBooks(): Observable<BooksListResponse> {
    return this.http.get<any>(`${this.apiUrl}/available`).pipe(
      retry(this.RETRY_COUNT),
      map(response => ({
        success: true,
        data: (response.data || []).map((book: any) => this.transformBook(book))
      })),
      catchError((error) => this.handleError(error, this.ERROR_MESSAGES.FETCH_BOOKS))
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

    console.error('BookService Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
