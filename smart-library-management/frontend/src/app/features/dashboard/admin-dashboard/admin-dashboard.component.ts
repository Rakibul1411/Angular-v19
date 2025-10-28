import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
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
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  // Dashboard statistics
  stats = signal({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    overdueLoans: 0
  });

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    // TODO: Replace with actual API calls when stats service is available
    // Placeholder data for now
    this.stats.set({
      totalBooks: 1250,
      totalUsers: 340,
      activeLoans: 89,
      overdueLoans: 12
    });
  }

  // Navigation methods
  navigateToBooks() {
    this.router.navigate(['/admin/books']);
  }

  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToLoans() {
    this.router.navigate(['/admin/loans']);
  }

  navigateToReports() {
    this.router.navigate(['/admin/reports']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still redirect to login even if logout fails
        this.router.navigate(['/login']);
      }
    });
  }
}
