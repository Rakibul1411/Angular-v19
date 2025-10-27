import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LoanService } from '../../../core/services/loan.service';
import { BookService } from '../../../core/services/book.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Book } from '../../../core/models/book';
import { User } from '../../../core/models/user';
import { PaginatedResponse } from '../../../core/models/api-response';

@Component({
  selector: 'app-loan-issue',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TooltipModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './loan-issue.component.html',
  styleUrl: './loan-issue.component.css'
})
export class LoanIssueComponent implements OnInit {
  issueForm!: FormGroup;
  books: Book[] = [];
  users: User[] = [];
  loading = false;
  isAdmin = false;
  currentUserId: string | null = null;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private bookService: BookService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.currentUserValue;
    this.isAdmin = currentUser?.role === 'admin';
    this.currentUserId = currentUser?.id || null;

    this.initForm();
    this.loadBooks();

    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  initForm() {
    // Default due date: 14 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);

    this.issueForm = this.fb.group({
      user_id: [this.isAdmin ? null : this.currentUserId, this.isAdmin ? Validators.required : []],
      book_id: [null, Validators.required],
      due_date: [defaultDueDate, Validators.required]
    });

    // If not admin, disable user selection
    if (!this.isAdmin) {
      this.issueForm.get('user_id')?.disable();
    }
  }

  loadBooks() {
    this.bookService.getAllBooks().subscribe({
      next: (response) => {
        // Handle paginated response
        const bookData = response.data || response;
        const books = Array.isArray(bookData) ? bookData : [];

        // Only show available books
        this.books = books.filter((book: Book) => {
          const available = book.available_copies || 0;
          return available > 0;
        });
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load books'
        });
      }
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        // Handle paginated response
        const userData = response.data || response;
        const users = Array.isArray(userData) ? userData : [];

        // Only show students and faculty
        this.users = users.filter((user: User) => user.role !== 'admin');
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
      }
    });
  }

  onSubmit() {
    if (this.issueForm.invalid) {
      this.markFormGroupTouched(this.issueForm);
      return;
    }

    this.loading = true;
    const formValue = this.issueForm.getRawValue();

    this.loanService.issueBook(formValue).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Book issued successfully'
        });
        setTimeout(() => {
          this.router.navigate(['/loans']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Failed to issue book'
        });
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getBookLabel(book: Book): string {
    const available = book.available_copies || 0;
    return `${book.title} by ${book.author} (${available} available)`;
  }

  getUserLabel(user: User): string {
    return `${user.name} (${user.email})`;
  }

  goBack() {
    this.router.navigate(['/loans']);
  }
}
