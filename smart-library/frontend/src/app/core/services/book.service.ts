import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookRequest, BookSearchParams } from '../models/book';
import { PaginatedResponse } from '../models/api-response';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/books`;

  getAllBooks(): Observable<PaginatedResponse<Book>> {
    return this.http.get<PaginatedResponse<Book>>(`${this.apiUrl}/all`);
  }

  searchBooks(params: BookSearchParams): Observable<Book[]> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.title) httpParams = httpParams.set('title', params.title);
    if (params.author) httpParams = httpParams.set('author', params.author);

    return this.http.get<Book[]>(`${this.apiUrl}/getBooks`, { params: httpParams });
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  addBook(book: BookRequest): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/addBook`, book);
  }

  updateBook(id: string, book: Partial<BookRequest>): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book);
  }

  deleteBook(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
