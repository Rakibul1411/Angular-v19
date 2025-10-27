import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoanService } from '../../../core/services/loan.service';
import { BookService } from '../../../core/services/book.service';
import { PaginatedResponse } from '../../../core/models/api-response';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-student-dashboard',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private loanService = inject(LoanService);
  private bookService = inject(BookService);
  private router = inject(Router);

  currentUser = this.authService.currentUserValue;
  stats = {
    totalBooks: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalBorrowed: 0
  };
  loading = false;

  ngOnInit(): void {
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.loading = true;
    const userId = this.currentUser?.id;

    if (!userId) {
      this.loading = false;
      return;
    }

    // Load user's loan history
    this.loanService.getUserLoans(userId).subscribe({
      next: (loans) => {
        this.stats.totalBorrowed = loans.length;
        this.stats.activeLoans = loans.filter(loan => loan.status === 'ACTIVE').length;
        this.stats.overdueLoans = loans.filter(loan =>
          this.loanService.isOverdue(loan)
        ).length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load user loans', error);
        this.loading = false;
      }
    });

    // Load total books count
    this.bookService.getAllBooks().subscribe({
      next: (response) => {
        // Handle paginated response
        const bookData = response.data || response;
        this.stats.totalBooks = Array.isArray(bookData) ? bookData.length : (response.count || 0);
      },
      error: (error) => {
        console.error('Failed to load books count', error);
      }
    });
  }

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }

  navigateToMyLoans(): void {
    this.router.navigate(['/loans']);
  }

  navigateToLoanHistory(): void {
    this.router.navigate(['/loans/history']);
  }

  navigateToIssueBook(): void {
    this.router.navigate(['/loans/issue']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/users/profile']);
  }

  logout(): void {
    this.authService.logout();
  }
}
