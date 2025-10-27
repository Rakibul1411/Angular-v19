import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookService } from '../../../core/services/book.service';
import { UserService } from '../../../core/services/user.service';
import { LoanService } from '../../../core/services/loan.service';
import { forkJoin } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private bookService = inject(BookService);
  private userService = inject(UserService);
  private loanService = inject(LoanService);
  private router = inject(Router);

  currentUser = this.authService.currentUserValue;
  systemOverview: any = {
    unique_books: 0,
    total_books: 0,
    total_users: 0,
    books_borrowed: 0,
    overdue_loans: 0,
    loans_today: 0,
    returns_today: 0
  };
  loading = false;

  ngOnInit(): void {
    this.loadSystemOverview();
  }

  loadSystemOverview(): void {
    this.loading = true;

    // Fetch system overview from loan service (includes all stats)
    this.loanService.getSystemOverview().subscribe({
      next: (overview) => {
        this.systemOverview = overview;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load system overview', error);
        // Fallback to loading books and users only
        this.loadBasicStats();
      }
    });
  }

  loadBasicStats(): void {
    // Fallback method if system overview fails
    forkJoin({
      books: this.bookService.getAllBooks(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: (results) => {
        this.systemOverview.total_books = results.books.count || results.books.data?.length || 0;
        this.systemOverview.total_users = results.users.count || results.users.data?.length || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard data', error);
        this.loading = false;
      }
    });
  }

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }

  navigateToLoans(): void {
    this.router.navigate(['/loans']);
  }

  navigateToOverdueLoans(): void {
    this.router.navigate(['/loans/overdue']);
  }

  logout(): void {
    this.authService.logout();
  }
}
