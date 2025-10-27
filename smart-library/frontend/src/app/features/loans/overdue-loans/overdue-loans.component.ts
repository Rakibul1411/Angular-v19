import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { LoanService } from '../../../core/services/loan.service';
import { Loan } from '../../../core/models/loan';

@Component({
  selector: 'app-overdue-loans',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    InputTextModule,
    FormsModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './overdue-loans.component.html',
  styleUrl: './overdue-loans.component.css'
})
export class OverdueLoansComponent implements OnInit {
  overdueLoans: Loan[] = [];
  filteredLoans: Loan[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private loanService: LoanService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadOverdueLoans();
  }

  loadOverdueLoans() {
    this.loading = true;
    this.loanService.getOverdueLoans().subscribe({
      next: (data) => {
        this.overdueLoans = data;
        this.filteredLoans = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading overdue loans:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load overdue loans'
        });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.overdueLoans];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.book?.title.toLowerCase().includes(term) ||
        loan.book?.author.toLowerCase().includes(term) ||
        loan.user?.name.toLowerCase().includes(term) ||
        loan.user?.email.toLowerCase().includes(term)
      );
    }

    this.filteredLoans = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  getSeverityByDays(daysOverdue: number): 'warning' | 'danger' {
    return daysOverdue > 7 ? 'danger' : 'warning';
  }

  returnBook(loan: Loan) {
    this.confirmationService.confirm({
      message: `Mark "${loan.book?.title}" as returned?`,
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
            this.loadOverdueLoans();
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

  sendReminder(loan: Loan) {
    // TODO: Implement email reminder functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Reminder',
      detail: `Reminder would be sent to ${loan.user?.name}`
    });
  }

  getOverdueWithin7Days(): number {
    return this.filteredLoans.filter(loan => (loan.days_overdue || 0) <= 7).length;
  }

  getOverdueMoreThan7Days(): number {
    return this.filteredLoans.filter(loan => (loan.days_overdue || 0) > 7).length;
  }

  getUniqueUsersCount(): number {
    const uniqueUsers = new Set(this.filteredLoans.map(loan => loan.user?.id || loan.user_id));
    return uniqueUsers.size;
  }

  goBack() {
    // Navigate to admin dashboard (this is admin-only page)
    this.router.navigate(['/dashboard/admin']);
  }
}
