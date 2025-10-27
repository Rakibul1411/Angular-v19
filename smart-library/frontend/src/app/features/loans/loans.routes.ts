import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const loansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./loan-list/loan-list.component').then(m => m.LoanListComponent)
  },
  {
    path: 'issue',
    loadComponent: () => import('./loan-issue/loan-issue.component').then(m => m.LoanIssueComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./loan-history/loan-history.component').then(m => m.LoanHistoryComponent)
  },
  {
    path: 'overdue',
    loadComponent: () => import('./overdue-loans/overdue-loans.component').then(m => m.OverdueLoansComponent),
    canActivate: [roleGuard(['admin'])]
  }
];
