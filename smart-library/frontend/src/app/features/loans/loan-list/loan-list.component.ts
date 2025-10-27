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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan } from '../../../core/models/loan';

@Component({
  selector: 'app-loan-list',
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
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './loan-list.component.html',
  styleUrl: './loan-list.component.css'
})
export class LoanListComponent implements OnInit {
  loans: Loan[] = [];
  filteredLoans: Loan[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = '';
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
    private confirmationService: ConfirmationService,
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

    // Admin sees all loans, students see only their own
    const loansObservable = this.isAdmin
      ? this.loanService.getAllLoans()
      : this.loanService.getUserLoans(this.currentUserId!);

    loansObservable.subscribe({
      next: (data) => {
        this.loans = data;
        this.filteredLoans = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading loans:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load loans'
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

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.book?.title.toLowerCase().includes(term) ||
        loan.book?.author.toLowerCase().includes(term) ||
        loan.user?.name.toLowerCase().includes(term)
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

  returnBook(loan: Loan) {
    this.confirmationService.confirm({
      message: `Are you sure you want to return "${loan.book?.title}"?`,
      header: 'Confirm Return',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const loanId = loan._id || loan.id;
        if (!loanId) return;

        this.loanService.returnBook({ loan_id: loanId }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Book returned successfully'
            });
            this.loadLoans();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.error || 'Failed to return book'
            });
          }
        });
      }
    });
  }

  extendLoan(loan: Loan) {
    const loanId = loan._id || loan.id;
    if (!loanId) return;

    // Default extension: 7 days
    this.loanService.extendLoan(loanId, 7).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Loan extended by 7 days'
        });
        this.loadLoans();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Failed to extend loan'
        });
      }
    });
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

  goToIssueBook() {
    this.router.navigate(['/loans/issue']);
  }

  goBack() {
    // Navigate to appropriate dashboard based on user role
    if (this.isAdmin) {
      this.router.navigate(['/dashboard/admin']);
    } else {
      this.router.navigate(['/dashboard/student']);
    }
  }
}
