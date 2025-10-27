import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Loan, LoanIssueRequest, LoanReturnRequest, LoanExtendRequest } from '../models/loan';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) { }

  // Issue a book to a user
  issueBook(request: LoanIssueRequest): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/issueBook`, request);
  }

  // Return a book
  returnBook(request: LoanReturnRequest): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/returns`, request);
  }

  // Get all loans for a specific user
  getUserLoans(userId: string): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/${userId}`);
  }

  // Get all loans (admin only)
  getAllLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/all`);
  }

  // Get all active loans (for admin)
  getAllActiveLoans(): Observable<Loan[]> {
    return this.getUserLoans('all');
  }

  // Get overdue loans (admin only)
  getOverdueLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/overdue`);
  }

  // Extend loan due date
  extendLoan(loanId: string, extensionDays: number): Observable<Loan> {
    const request: LoanExtendRequest = { extension_days: extensionDays };
    return this.http.put<Loan>(`${this.apiUrl}/${loanId}/extend`, request);
  }

  // Get popular books (admin only)
  getPopularBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/books/popular`);
  }

  // Get active users (admin only)
  getActiveUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/active`);
  }

  // Get system overview statistics (admin only)
  getSystemOverview(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/overview`);
  }

  // Helper method to check if loan is overdue
  isOverdue(loan: Loan): boolean {
    if (loan.status === 'RETURNED') return false;
    const dueDate = new Date(loan.due_date);
    return dueDate < new Date();
  }

  // Helper method to calculate days overdue
  getDaysOverdue(loan: Loan): number {
    if (!this.isOverdue(loan)) return 0;
    const dueDate = new Date(loan.due_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - dueDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
