import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookService } from '../../../core/services/book.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  Book,
  BookCategory,
  BOOK_CATEGORIES,
  getBookId,
  getAvailabilityLabel,
  getAvailabilitySeverity
} from '../../../core/models/book.model';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Component for displaying and managing the list of books
 * Supports search, filtering by category/availability, and CRUD operations (admin only)
 */
@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  readonly books = signal<Book[]>([]);
  readonly filteredBooks = signal<Book[]>([]);
  readonly isLoading = signal(false);
  readonly searchText = signal('');
  readonly selectedCategoryFilter = signal<'all' | BookCategory>('all');
  readonly selectedAvailabilityFilter = signal<'all' | 'available' | 'unavailable'>('all');

  // Auth state
  readonly currentUser = this.authService.currentUser;
  readonly isAdmin = this.authService.isAdmin;

  // Computed statistics
  readonly totalBooks = computed(() => this.books().length);
  readonly availableBooks = computed(() => this.books().filter(b => b.availableCopies > 0).length);
  readonly unavailableBooks = computed(() => this.books().filter(b => b.availableCopies === 0).length);

  // Filter options
  readonly categoryFilterOptions = [
    { label: 'All Categories', value: 'all' },
    ...BOOK_CATEGORIES
  ];

  readonly availabilityFilterOptions = [
    { label: 'All Books', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Unavailable', value: 'unavailable' }
  ];

  ngOnInit(): void {
    this.loadBooks();
  }

  /**
   * Load all books from the API
   */
  loadBooks(): void {
    this.isLoading.set(true);
    this.bookService.getAllBooks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.books.set(response.data);
          this.applyFilters();
          this.isLoading.set(false);
        },
        error: (error) => {
          this.showError('Failed to load books', error.message);
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Apply all active filters to the books list
   */
  applyFilters(): void {
    let filtered = [...this.books()];

    // Apply category filter
    if (this.selectedCategoryFilter() !== 'all') {
      filtered = filtered.filter(book => book.category === this.selectedCategoryFilter());
    }

    // Apply availability filter
    const availFilter = this.selectedAvailabilityFilter();
    if (availFilter === 'available') {
      filtered = filtered.filter(book => book.availableCopies > 0);
    } else if (availFilter === 'unavailable') {
      filtered = filtered.filter(book => book.availableCopies === 0);
    }

    // Apply search filter
    const search = this.searchText().toLowerCase();
    if (search) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.isbn.toLowerCase().includes(search) ||
        (book.publisher?.toLowerCase().includes(search) ?? false)
      );
    }

    this.filteredBooks.set(filtered);
  }

  /**
   * Handle search input changes
   */
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
    this.applyFilters();
  }

  /**
   * Handle category filter changes
   */
  onCategoryFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Handle availability filter changes
   */
  onAvailabilityFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Navigate to book details view
   */
  viewBookDetails(book: Book): void {
    const bookId = getBookId(book);
    if (!bookId) return;

    if (this.isAdmin()) {
      this.router.navigate(['/admin/books', bookId]);
    } else {
      this.router.navigate(['/student/books', bookId]);
    }
  }

  /**
   * Navigate to add new book form (admin only)
   */
  addNewBook(): void {
    this.router.navigate(['/admin/books/new']);
  }

  /**
   * Navigate to edit book form (admin only)
   */
  editBook(book: Book): void {
    const bookId = getBookId(book);
    if (bookId) {
      this.router.navigate(['/admin/books', bookId, 'edit']);
    }
  }

  /**
   * Delete a book with confirmation (admin only)
   */
  deleteBook(book: Book): void {
    const bookId = getBookId(book);

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (bookId) {
          this.performDelete(bookId);
        }
      }
    });
  }

  /**
   * Perform the actual delete operation
   */
  private performDelete(bookId: string): void {
    this.bookService.deleteBook(bookId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showSuccess('Book deleted successfully');
          this.loadBooks();
        },
        error: (error) => {
          this.showError('Failed to delete book', error.message);
        }
      });
  }

  /**
   * Get availability severity using model helper
   */
  getAvailabilitySeverity(availableCopies: number): 'success' | 'warn' | 'danger' {
    return getAvailabilitySeverity(availableCopies);
  }

  /**
   * Get availability label using model helper
   */
  getAvailabilityLabel(availableCopies: number): string {
    return getAvailabilityLabel(availableCopies);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Show success toast message
   */
  private showSuccess(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail
    });
  }

  /**
   * Show error toast message
   */
  private showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail
    });
  }
}
