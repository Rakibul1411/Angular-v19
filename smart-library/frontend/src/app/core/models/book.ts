export interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  isbn: string;
  copies: number;
  available_copies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookRequest {
  title: string;
  author: string;
  isbn: string;
  copies: number;
}

export interface BookSearchParams {
  search?: string;
  title?: string;
  author?: string;
}
