import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan } from '../../../core/models/loan';

@Component({
  selector: 'app-loan-history',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    DatePickerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './loan-history.component.html',
  styleUrl: './loan-history.component.css'
})
export class LoanHistoryComponent implements OnInit {
  loans: Loan[] = [];
  filteredLoans: Loan[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  isAdmin = false;
  currentUserId: string | null = null;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Returned', value: 'RETURNED' }
  ];

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.currentUserValue;
    this.isAdmin = currentUser?.role === 'admin';
    this.currentUserId = currentUser?.id || null;
    this.loadLoans();
  }

  loadLoans() {
    this.loading = true;

    this.loanService.getUserLoans(this.currentUserId!).subscribe({
      next: (data) => {
        this.loans = data;
        this.filteredLoans = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading loan history:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load loan history'
        });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.loans];

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(loan => loan.status === this.selectedStatus);
    }

    // Date range filter
    if (this.dateFrom) {
      filtered = filtered.filter(loan => {
        const issueDate = new Date(loan.issue_date);
        return issueDate >= this.dateFrom!;
      });
    }

    if (this.dateTo) {
      filtered = filtered.filter(loan => {
        const issueDate = new Date(loan.issue_date);
        return issueDate <= this.dateTo!;
      });
    }

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.book?.title.toLowerCase().includes(term) ||
        loan.book?.author.toLowerCase().includes(term) ||
        (this.isAdmin && loan.user?.name.toLowerCase().includes(term))
      );
    }

    this.filteredLoans = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.applyFilters();
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'RETURNED':
        return 'info';
      default:
        return 'warning';
    }
  }

  isOverdue(loan: Loan): boolean {
    return this.loanService.isOverdue(loan);
  }

  getDaysOverdue(loan: Loan): number {
    return this.loanService.getDaysOverdue(loan);
  }

  getLoanDuration(loan: Loan): number {
    const issueDate = new Date(loan.issue_date);
    const endDate = loan.return_date ? new Date(loan.return_date) : new Date();
    const diffTime = Math.abs(endDate.getTime() - issueDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  goBack() {
    // Navigate to appropriate dashboard based on user role
    if (this.isAdmin) {
      this.router.navigate(['/dashboard/admin']);
    } else {
      this.router.navigate(['/dashboard/student']);
    }
  }

  exportHistory() {
    // TODO: Implement export to CSV functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Export functionality will be available soon'
    });
  }
}
