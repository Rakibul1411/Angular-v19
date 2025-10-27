export interface Loan {
  _id?: string;
  id?: string;
  user_id?: string;
  book_id?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  book?: {
    id: string;
    title: string;
    author: string;
  };
  issue_date: Date | string;
  due_date: Date | string;
  return_date?: Date | string | null;
  status: 'ACTIVE' | 'RETURNED';
  original_due_date?: Date | string;
  extended_due_date?: Date | string;
  extensions_count?: number;
  days_overdue?: number;
}

export interface LoanIssueRequest {
  user_id?: string;
  book_id: string;
  due_date: Date | string;
}

export interface LoanReturnRequest {
  loan_id: string;
}

export interface LoanExtendRequest {
  extension_days: number;
}
