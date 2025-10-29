export interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  isbn: string;
  copies: number;
  available_copies: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}


export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  copies: number;
}


export interface UpdateBookDto {
  title?: string;
  author?: string;
  isbn?: string;
  copies?: number;
  available_copies?: number;
}


export function getBookId(book: Book): string | undefined {
  return book._id || book.id;
}


export function isBookAvailable(book: Book): boolean {
  return book.available_copies > 0;
}


export function getAvailabilityLabel(availableCopies: number): string {
  if (availableCopies === 0) return 'Unavailable';
  if (availableCopies === 1) return '1 Copy Available';
  return `${availableCopies} Copies Available`;
}


export function getAvailabilityStatus(availableCopies: number): 'available' | 'low' | 'unavailable' {
  if (availableCopies === 0) return 'unavailable';
  if (availableCopies <= 2) return 'low';
  return 'available';
}

