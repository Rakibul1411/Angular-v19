import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { AuthService } from '../../../core/services/auth.service';
import { Book } from '../../../core/models/book';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-book-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit {
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  books: Book[] = [];
  loading = false;
  searchTerm = '';

  get isAdmin(): boolean {
    return this.authService.hasRole(['admin']);
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (response) => {
        this.books = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load books'
        });
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.loadBooks();
      return;
    }

    this.loading = true;
    this.bookService.searchBooks({ search: this.searchTerm }).subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Search failed'
        });
      }
    });
  }

  viewDetails(book: Book): void {
    const bookId = book._id || book.id;
    if (bookId) {
      this.router.navigate(['/books', bookId]);
    }
  }

  editBook(book: Book): void {
    const bookId = book._id || book.id;
    if (bookId) {
      this.router.navigate(['/books/edit', bookId]);
    }
  }

  deleteBook(book: Book): void {
    const bookId = book._id || book.id;
    if (!bookId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Book ID not found'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${book.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.bookService.deleteBook(bookId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Book deleted successfully'
            });
            this.loadBooks();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete book'
            });
          }
        });
      }
    });
  }

  addNewBook(): void {
    this.router.navigate(['/books/add']);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadBooks();
  }

  goToDashboard(): void {
    // Navigate to appropriate dashboard based on user role
    if (this.isAdmin) {
      this.router.navigate(['/dashboard/admin']);
    } else {
      this.router.navigate(['/dashboard/student']);
    }
  }
}
