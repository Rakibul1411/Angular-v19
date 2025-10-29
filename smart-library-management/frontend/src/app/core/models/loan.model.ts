import { User } from './user.model';
import { Book } from './book.model';

/**
 * Loan interface - matches backend Loan model
 */
export interface Loan {
  _id?: string;
  id?: string;
  user: string | User;
  book: string | Book;
  issue_date: Date | string;
  due_date: Date | string;
  return_date?: Date | string;
  status: LoanStatus;
  original_due_date?: Date | string;
  extended_due_date?: Date | string;
  extensions_count: number;
}

/**
 * Loan status enum
 */
export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED'
}

/**
 * DTO for creating a new loan
 */
export interface CreateLoanDto {
  user: string;
  book: string;
  due_date: Date | string;
}

/**
 * DTO for updating loan information
 */
export interface UpdateLoanDto {
  return_date?: Date | string;
  status?: LoanStatus;
  extended_due_date?: Date | string;
  extensions_count?: number;
}

/**
 * Get loan ID (handles both _id and id fields)
 */
export function getLoanId(loan: Loan): string | undefined {
  return loan._id || loan.id;
}

/**
 * Check if loan is overdue
 */
export function isLoanOverdue(loan: Loan): boolean {
  if (loan.status === LoanStatus.RETURNED) return false;
  const dueDate = new Date(loan.due_date);
  return dueDate < new Date();
}

/**
 * Get days until due
 */
export function getDaysUntilDue(loan: Loan): number {
  const dueDate = new Date(loan.due_date);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
