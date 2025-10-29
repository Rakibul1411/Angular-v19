import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css'
})
export class AddBookComponent {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  isSaving = signal(false);

  bookForm: FormGroup;

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      isbn: ['', [Validators.required]],
      copies: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    if (this.bookForm.valid) {
      this.isSaving.set(true);

      this.bookService.createBook(this.bookForm.value).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Book added successfully'
          });
          setTimeout(() => {
            this.router.navigate(['/app/admin/books']);
          }, 1500);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || 'Failed to add book'
          });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/app/admin/books']);
  }
}
