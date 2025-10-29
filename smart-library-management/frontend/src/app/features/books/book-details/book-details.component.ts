import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../../core/models/book.model';
import { UserRole } from '../../../core/models/user.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css'
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private bookService = inject(BookService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  currentUser = this.authService.currentUser;
  book = signal<Book | null>(null);
  isLoading = signal(false);
  isEditMode = signal(false);
  isSaving = signal(false);

  bookForm: FormGroup;

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      isbn: ['', [Validators.required]],
      copies: [1, [Validators.required, Validators.min(1)]],
      available_copies: [1, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'edit') {
        this.isEditMode.set(true);
      }
    });

    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBookById(bookId);
    }
  }

  loadBookById(bookId: string) {
    this.isLoading.set(true);

    this.bookService.getBookById(bookId).subscribe({
      next: (book) => {
        this.book.set(book);
        this.bookForm.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          copies: book.copies,
          available_copies: book.available_copies
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load book details'
        });
        this.isLoading.set(false);
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === UserRole.ADMIN;
  }

  toggleEditMode() {
    this.isEditMode.update(mode => !mode);
    if (!this.isEditMode()) {
      const book = this.book();
      if (book) {
        this.bookForm.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          copies: book.copies,
          available_copies: book.available_copies
        });
      }
    }
  }

  onSubmit() {
    if (this.bookForm.valid) {
      this.isSaving.set(true);
      const bookId = this.book()?._id;

      if (!bookId) return;

      this.bookService.updateBook(bookId, this.bookForm.value).subscribe({
        next: (response) => {
          this.book.set(response);
          this.isEditMode.set(false);
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Book updated successfully'
          });
        },
        error: (error) => {
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.userMessage || 'Failed to update book'
          });
        }
      });
    }
  }

  deleteBook() {
    const book = this.book();
    if (!book) return;

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
              detail: 'Book deleted successfully'
            });
            setTimeout(() => {
              this.goBack();
            }, 1500);
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

  goBack() {
    this.router.navigate(['/app/books']);
  }

  getAvailabilityPercentage(): number {
    const book = this.book();
    if (!book) return 0;
    return (book.available_copies / book.copies) * 100;
  }

  getAvailabilityClass(): string {
    const percentage = this.getAvailabilityPercentage();
    if (percentage === 0) return 'text-red-600';
    if (percentage < 30) return 'text-orange-600';
    return 'text-green-600';
  }
}
