/**
 * Book interface representing a book in the library system
 */
export interface Book {
  _id?: string; // MongoDB ID
  id?: string; // Alternative ID field
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  category?: BookCategory;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  copies?: number; // Backend snake_case field
  available_copies?: number; // Backend snake_case field
  shelfLocation?: string;
  coverImage?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * DTO for creating a new book
 */
export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publishedYear?: number;
  category?: BookCategory;
  description?: string;
  totalCopies: number;
  shelfLocation?: string;
  coverImage?: string;
}

/**
 * DTO for updating book information
 */
export interface UpdateBookDto {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  category?: BookCategory;
  description?: string;
  totalCopies?: number;
  availableCopies?: number;
  shelfLocation?: string;
  coverImage?: string;
}

/**
 * Response structure for books list endpoint
 */
export interface BooksListResponse {
  success: boolean;
  data: Book[];
  message?: string;
  count?: number;
}

/**
 * Response structure for single book operations
 */
export interface BookResponse {
  success: boolean;
  data: Book;
  message?: string;
}

/**
 * Response structure for book deletion
 */
export interface DeleteBookResponse {
  success: boolean;
  message: string;
}

/**
 * Book category type
 */
export type BookCategory =
  | 'Fiction'
  | 'Non-Fiction'
  | 'Science'
  | 'Technology'
  | 'History'
  | 'Biography'
  | 'Education'
  | 'Other';

/**
 * Book availability status
 */
export enum BookAvailabilityStatus {
  AVAILABLE = 'available',
  LOW_STOCK = 'low_stock',
  UNAVAILABLE = 'unavailable'
}

/**
 * Book category options for dropdowns
 */
export const BOOK_CATEGORIES: ReadonlyArray<{ label: string; value: BookCategory }> = [
  { label: 'Fiction', value: 'Fiction' },
  { label: 'Non-Fiction', value: 'Non-Fiction' },
  { label: 'Science', value: 'Science' },
  { label: 'Technology', value: 'Technology' },
  { label: 'History', value: 'History' },
  { label: 'Biography', value: 'Biography' },
  { label: 'Education', value: 'Education' },
  { label: 'Other', value: 'Other' }
] as const;

/**
 * Get book ID (handles both _id and id fields)
 */
export function getBookId(book: Book): string | undefined {
  return book._id || book.id;
}

/**
 * Check if book is available
 */
export function isBookAvailable(book: Book): boolean {
  return book.availableCopies > 0;
}

/**
 * Get book availability status
 */
export function getBookAvailabilityStatus(book: Book): BookAvailabilityStatus {
  if (book.availableCopies === 0) {
    return BookAvailabilityStatus.UNAVAILABLE;
  }
  if (book.availableCopies <= 2) {
    return BookAvailabilityStatus.LOW_STOCK;
  }
  return BookAvailabilityStatus.AVAILABLE;
}

/**
 * Get availability label for display
 */
export function getAvailabilityLabel(availableCopies: number): string {
  if (availableCopies === 0) return 'Unavailable';
  if (availableCopies === 1) return '1 Copy';
  return `${availableCopies} Copies`;
}

/**
 * Get availability severity for PrimeNG components
 */
export function getAvailabilitySeverity(availableCopies: number): 'success' | 'warn' | 'danger' {
  if (availableCopies === 0) return 'danger';
  if (availableCopies <= 2) return 'warn';
  return 'success';
}

/**
 * Validate ISBN format (10 or 13 digits)
 */
export function isValidISBN(isbn: string): boolean {
  const isbnPattern = /^(?:\d{10}|\d{13})$/;
  return isbnPattern.test(isbn);
}

