import { loanService } from '../services/index.js';

// Issue a book to a user
export const issueBook = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    // Ensure the loan is created under the logged-in user unless admin specifies another user
    const loanData = {
      user_id: req.body.user_id || currentUser.id,
      book_id: req.body.book_id,
      due_date: req.body.due_date
    };

    const loan = await loanService.createLoan(loanData);

    if (!loan.success) {
      const statusCode = 
        loan.error === 'User not found' || loan.error === 'Book not found' ? 404 :
        loan.error === 'No available copies' ? 400 :
        500;
      
      return res.status(statusCode).json({ 
        success: false, 
        error: loan.error 
      });
    }

    res.status(201).json(loan.data);
  } catch (err) {
    next(err);
  }
};

// Return a book
export const returnBook = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    // Optionally, ensure the requester is the loan owner or admin
    const loanRecord = await loanService.findLoanById(req.body.loan_id);
    if (!loanRecord) return res.status(404).json({ success: false, error: 'Loan not found' });
    if (loanRecord.user.toString() !== currentUser.id && currentUser.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to return this loan' });
    }

    const loan = await loanService.returnLoan(req.body.loan_id);
    
    if (!loan.success) {
      return res.status(loan.error === 'Loan not found' 
        ? 404 
        : 400
      ).json({ success: false, error: loan.error });
    }

    res.status(200).json(loan.data);
  } catch (err) {
    next(err);
  }
};

// Get loan history for a user
export const getUserLoans = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    // Debug logging
    console.log('getUserLoans - currentUser.id:', currentUser.id, 'type:', typeof currentUser.id);
    console.log('getUserLoans - user_id from params:', user_id, 'type:', typeof user_id);
    console.log('getUserLoans - currentUser.role:', currentUser.role);

    // Allow only the user themselves or admin
    // Convert both to strings for comparison
    if (String(currentUser.id) !== String(user_id) && currentUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to view these loans',
        debug: {
          currentUserId: currentUser.id,
          requestedUserId: user_id,
          role: currentUser.role
        }
      });
    }

    const serviceResult = await loanService.getUserLoans(user_id);
    
    if (!serviceResult.success) {
      return res.status(404).json({ 
        success: false, 
        error: serviceResult.error 
      });
    }

    return res.status(200).json(serviceResult.data);
  } catch (err) {
    next(err);
  }
};

// Get all loans (admin only)
export const getAllLoans = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const serviceResult = await loanService.getAllLoans();
    
    if (!serviceResult.success) {
      return res.status(500).json({
        success: false,
        error: serviceResult.error
      });
    }

    return res.status(200).json(serviceResult.data);
  } catch (err) {
    next(err);
  }
};

// Get overdue loans
export const getOverdueLoans = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

    const result = await loanService.getOverdueLoans();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

// Extend loan due date
export const extendLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { extension_days } = req.body;

    if (!extension_days || extension_days <= 0) {
      return res.status(400).json({
        error: 'Valid extension days are required'
      });
    }

    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    const loanRecord = await loanService.findLoanById(id);
    if (!loanRecord) return res.status(404).json({ error: 'Loan not found' });
    if (loanRecord.user.toString() !== currentUser.id && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to extend this loan' });
    }

    const result = await loanService.extendLoan(id, extension_days);
    
    if (!result.success) {
      const statusCode = result.error === 'Loan not found' ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

// Get most borrowed books
export const getPopularBooks = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    const result = await loanService.getPopularBooks();
    
    if (!result.success) {
      return res.status(500).json({
        error: result.error
      });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

// Get most active users
export const getActiveUsers = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    const result = await loanService.getActiveUsers();
    
    if (!result.success) {
      return res.status(500).json({
        error: result.error
      });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

// Get system overview statistics
export const getSystemOverview = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

    const result = await loanService.getSystemOverview();
    
    if (!result.success) {
      return res.status(500).json({
        error: result.error
      });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};
