import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { AuthService } from '../../../core/services/auth.service';
import { Book } from '../../../core/models/book.model';
import { UserRole } from '../../../core/models/user.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    ToastModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit {
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  books = signal<Book[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  currentUser = this.authService.currentUser;

  // Search filters
  searchQuery = signal<string>('');

  // Computed filtered books based on search query
  filteredBooks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allBooks = this.books();

    if (!query) {
      return allBooks;
    }

    return allBooks.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookService.getAllBooks().subscribe({
      next: (response) => {
        this.books.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        const message = error.userMessage || 'Failed to load books';
        this.errorMessage.set(message);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message
        });
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === UserRole.ADMIN;
  }

  viewBookDetails(bookId: string) {
    this.router.navigate(['/app/books', bookId]);
  }

  editBook(event: Event, bookId: string) {
    event.stopPropagation();
    this.router.navigate(['/app/books', bookId], {
      queryParams: { mode: 'edit' }
    });
  }

  deleteBook(event: Event, book: Book) {
    event.stopPropagation();

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${book.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.bookService.deleteBook(book._id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `"${book.title}" has been deleted successfully`
            });
            this.loadBooks();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.userMessage || 'Failed to delete book'
            });
          }
        });
      }
    });
  }

  addNewBook() {
    this.router.navigate(['/app/admin/books/add']);
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  getAvailabilityClass(available: number, total: number): string {
    const percentage = (available / total) * 100;
    if (percentage === 0) return 'text-red-600';
    if (percentage < 30) return 'text-orange-600';
    return 'text-green-600';
  }
}
