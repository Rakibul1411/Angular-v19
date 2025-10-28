import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  // Dashboard statistics
  stats = signal({
    booksIssued: 0,
    booksReturned: 0,
    overdueBooks: 0,
    availableBooks: 0
  });

  // Mock data for current loans (TODO: Replace with actual API call)
  currentLoans = signal([
    {
      id: '1',
      bookTitle: 'Clean Code',
      author: 'Robert C. Martin',
      issueDate: new Date('2025-01-15'),
      dueDate: new Date('2025-02-15'),
      status: 'active'
    },
    {
      id: '2',
      bookTitle: 'Design Patterns',
      author: 'Gang of Four',
      issueDate: new Date('2025-01-20'),
      dueDate: new Date('2025-02-20'),
      status: 'active'
    }
  ]);

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    // TODO: Replace with actual API calls when stats service is available
    // Placeholder data for now
    this.stats.set({
      booksIssued: 2,
      booksReturned: 15,
      overdueBooks: 0,
      availableBooks: 1248
    });
  }

  // Navigation methods
  navigateToBrowseBooks() {
    this.router.navigate(['/student/books']);
  }

  navigateToMyLoans() {
    this.router.navigate(['/student/loans']);
  }

  navigateToHistory() {
    this.router.navigate(['/student/history']);
  }

  getDaysRemaining(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getStatusSeverity(daysRemaining: number): 'success' | 'warn' | 'danger' {
    if (daysRemaining < 0) return 'danger';
    if (daysRemaining <= 3) return 'warn';
    return 'success';
  }

  getStatusLabel(daysRemaining: number): string {
    if (daysRemaining < 0) return `Overdue by ${Math.abs(daysRemaining)} days`;
    if (daysRemaining === 0) return 'Due Today';
    return `${daysRemaining} days left`;
  }
}
