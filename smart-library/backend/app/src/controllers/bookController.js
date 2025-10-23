import { bookService } from '../services/index.js';

// Add a new book
export const addBook = async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body);
    
    if (!book) {
      return res.status(409).json({
        error: 'Book with this ISBN already exists'
      });
    }

    res.status(201).json( book );
  } catch (err) {
    next(err);
  }
};


// Get all books by title, author, or keyword
export const getBooks = async (req, res, next) => {
  try {
    const { search, title, author } = req.query;
    const books = await bookService.searchBooks(search, title, author);
    
    res.status(200).json( books );
  } catch (err) {
    next(err);
  }
};


// Get all books (no search) - used for listing all available books
export const getAllBooksController = async (req, res, next) => {
  try {
    const books = await bookService.getAllBooks();

    res.status(200).json(
      books.map(formatBookResponse)
    );
  } catch (err) {
    next(err);
  }
};


// Get book by ID
export const getBookById = async (req, res, next) => {
  try {
    const book = await bookService.findBookById(req.params.id);

    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
      });
    }

    res.status(200).json( formatBookResponse(book) );
  } catch (err) {
    next(err);
  }
};


// Update book
export const updateBook = async (req, res, next) => {
  try {
    const book = await bookService.updateBookById(req.params.id, req.body);

    if (book === null) {
      if (req.body.isbn) {
        return res.status(409).json({
          success: false,
          error: 'ISBN already exists for another book',
        });
      }
      return res.status(400).json({
        error: 'Available copies cannot exceed total copies',
      });
    }

    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
      });
    }

    res.status(200).json( formatBookResponse(book) );
  } catch (err) {
    next(err);
  }
};


// Delete book
export const deleteBook = async (req, res, next) => {
  try {
    const book = await bookService.deleteBookById(req.params.id);

    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
      });
    }

    res.status(200).json( {'message': 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
};


const formatBookResponse = (book) => ({
  id: book._id,
  title: book.title,
  author: book.author,
  isbn: book.isbn,
  copies: book.copies,
  available_copies: book.available_copies,
  created_at: book.createdAt.toISOString(),
  updated_at: book.updatedAt.toISOString()
});