import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BookService } from '../../../core/services/book.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-book-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.css'
})
export class BookFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  bookForm: FormGroup;
  loading = false;
  isEditMode = false;
  bookId: string | null = null;

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      isbn: ['', [Validators.required, Validators.pattern(/^[\d-]+$/)]],
      copies: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('id');

    if (this.bookId) {
      this.isEditMode = true;
      this.loadBook(this.bookId);
    }
  }

  loadBook(id: string): void {
    this.loading = true;
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.bookForm.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          copies: book.copies
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load book details'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.bookId) {
      this.bookService.updateBook(this.bookId, this.bookForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Book updated successfully'
          });
          setTimeout(() => this.router.navigate(['/books']), 1500);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update book'
          });
        }
      });
    } else {
      this.bookService.addBook(this.bookForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Book added successfully'
          });
          setTimeout(() => this.router.navigate(['/books']), 1500);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || 'Failed to add book'
          });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }

  get title() {
    return this.bookForm.get('title');
  }

  get author() {
    return this.bookForm.get('author');
  }

  get isbn() {
    return this.bookForm.get('isbn');
  }

  get copies() {
    return this.bookForm.get('copies');
  }
}
