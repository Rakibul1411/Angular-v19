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

export interface BooksListResponse {
  data: Book[];
  count: number;
}

export interface DeleteBookResponse {
  message: string;
}

