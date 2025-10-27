import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { AuthService } from '../../../core/services/auth.service';
import { Book } from '../../../core/models/book';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-book-details',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    TooltipModule
  ],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css'
})
export class BookDetailsComponent implements OnInit {
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  book: Book | null = null;
  loading = false;
  bookId: string | null = null;

  get isAdmin(): boolean {
    return this.authService.hasRole(['admin']);
  }

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('id');

    if (this.bookId) {
      this.loadBook(this.bookId);
    }
  }

  loadBook(id: string): void {
    this.loading = true;
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load book', error);
        this.router.navigate(['/books']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  editBook(): void {
    if (this.bookId) {
      this.router.navigate(['/books/edit', this.bookId]);
    }
  }

  borrowBook(): void {
    if (this.bookId) {
      this.router.navigate(['/loans/issue'], { queryParams: { bookId: this.bookId } });
    }
  }
}
