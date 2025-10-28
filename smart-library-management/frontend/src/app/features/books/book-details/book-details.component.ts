import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { AuthService } from '../../../core/services/auth.service';
import { Book, CreateBookDto, UpdateBookDto } from '../../../core/models/book.model';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    InputNumberModule,
    SelectModule,
    TagModule,
    ToastModule,
    SkeletonModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css'
})
export class BookDetailsComponent implements OnInit {
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  book = signal<Book | null>(null);
  isLoading = signal(false);
  isEditing = signal(false);
  isSaving = signal(false);
  isNewBook = signal(false);

  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;

  bookForm: FormGroup;

  categoryOptions = [
    { label: 'Fiction', value: 'Fiction' },
    { label: 'Non-Fiction', value: 'Non-Fiction' },
    { label: 'Science', value: 'Science' },
    { label: 'Technology', value: 'Technology' },
    { label: 'History', value: 'History' },
    { label: 'Biography', value: 'Biography' },
    { label: 'Education', value: 'Education' },
    { label: 'Other', value: 'Other' }
  ];

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      isbn: ['', [Validators.required, Validators.pattern(/^(?:\d{10}|\d{13})$/)]],
      publisher: [''],
      publishedYear: [null, [Validators.min(1000), Validators.max(new Date().getFullYear())]],
      category: [''],
      description: [''],
      totalCopies: [1, [Validators.required, Validators.min(1)]],
      availableCopies: [1, [Validators.min(0)]],
      shelfLocation: [''],
      coverImage: ['']
    });
  }

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    const isEditMode = this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (bookId === 'new') {
      // Creating new book
      this.isNewBook.set(true);
      this.isEditing.set(true);
      this.bookForm.get('availableCopies')?.disable();
    } else if (bookId) {
      // Viewing or editing existing book
      this.loadBook(bookId);
      if (isEditMode && this.isAdmin()) {
        this.isEditing.set(true);
      }
    }

    // Sync availableCopies with totalCopies for new books
    if (this.isNewBook()) {
      this.bookForm.get('totalCopies')?.valueChanges.subscribe(value => {
        this.bookForm.get('availableCopies')?.setValue(value, { emitEvent: false });
      });
    }
  }

  loadBook(id: string) {
    this.isLoading.set(true);
    this.bookService.getBookById(id).subscribe({
      next: (response) => {
        this.book.set(response.data);
        this.populateForm(response.data);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load book details'
        });
        this.isLoading.set(false);
        // Navigate back on error
        const backRoute = this.isAdmin() ? '/admin/books' : '/student/books';
        this.router.navigate([backRoute]);
      }
    });
  }

  populateForm(book: Book) {
    this.bookForm.patchValue({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || null,
      category: book.category || '',
      description: book.description || '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      shelfLocation: book.shelfLocation || '',
      coverImage: book.coverImage || ''
    });
  }

  toggleEdit() {
    if (!this.isAdmin()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Access Denied',
        detail: 'Only administrators can edit books'
      });
      return;
    }

    if (this.isEditing() && !this.isNewBook()) {
      // Cancel edit - reset form
      if (this.book()) {
        this.populateForm(this.book()!);
      }
    }
    this.isEditing.set(!this.isEditing());
  }

  saveBook() {
    if (!this.bookForm.valid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.bookForm.controls).forEach(key => {
        this.bookForm.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly'
      });
      return;
    }

    this.isSaving.set(true);

    if (this.isNewBook()) {
      // Create new book
      const createData: CreateBookDto = {
        title: this.bookForm.value.title,
        author: this.bookForm.value.author,
        isbn: this.bookForm.value.isbn,
        publisher: this.bookForm.value.publisher || undefined,
        publishedYear: this.bookForm.value.publishedYear || undefined,
        category: this.bookForm.value.category || undefined,
        description: this.bookForm.value.description || undefined,
        totalCopies: this.bookForm.value.totalCopies,
        shelfLocation: this.bookForm.value.shelfLocation || undefined,
        coverImage: this.bookForm.value.coverImage || undefined
      };

      this.bookService.createBook(createData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Book created successfully'
          });
          this.isSaving.set(false);
          this.router.navigate(['/admin/books']);
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create book'
          });
          this.isSaving.set(false);
        }
      });
    } else {
      // Update existing book
      const updateData: UpdateBookDto = this.bookForm.value;
      const bookId = this.book()?._id || this.book()?.id;

      if (!bookId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Book ID not found'
        });
        this.isSaving.set(false);
        return;
      }

      this.bookService.updateBook(bookId, updateData).subscribe({
        next: (response) => {
          this.book.set(response.data);
          this.isEditing.set(false);
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Book updated successfully'
          });
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update book'
          });
          this.isSaving.set(false);
        }
      });
    }
  }

  cancelNewBook(): void {
    const backRoute = this.isAdmin() ? '/admin/books' : '/student/books';
    this.router.navigate([backRoute]);
  }

  getAvailabilitySeverity(availableCopies: number): 'success' | 'warn' | 'danger' {
    if (availableCopies === 0) return 'danger';
    if (availableCopies <= 2) return 'warn';
    return 'success';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  hasError(field: string, error: string): boolean {
    const control = this.bookForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.bookForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
