import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Default route - redirect to login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Public routes (Auth)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Smart Library'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Register - Smart Library'
  },

  // Admin routes - Protected with authGuard and roleGuard
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - Smart Library'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
        title: 'Manage Users - Smart Library'
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-details/user-details.component').then(m => m.UserDetailsComponent),
        title: 'User Details - Smart Library'
      },
      {
        path: 'books',
        loadComponent: () => import('./features/books/book-list/book-list.component').then(m => m.BookListComponent),
        title: 'Manage Books - Smart Library'
      },
      {
        path: 'books/new',
        loadComponent: () => import('./features/books/book-details/book-details.component').then(m => m.BookDetailsComponent),
        title: 'Add Book - Smart Library'
      },
      {
        path: 'books/:id',
        loadComponent: () => import('./features/books/book-details/book-details.component').then(m => m.BookDetailsComponent),
        title: 'Book Details - Smart Library'
      },
      {
        path: 'books/:id/edit',
        loadComponent: () => import('./features/books/book-details/book-details.component').then(m => m.BookDetailsComponent),
        title: 'Edit Book - Smart Library'
      },
      // Add more admin routes here as you create them
      // {
      //   path: 'books',
      //   loadComponent: () => import('./features/books/books-list/books-list.component').then(m => m.BooksListComponent),
      //   title: 'Manage Books - Smart Library'
      // },
      // {
      //   path: 'loans',
      //   loadComponent: () => import('./features/loans/loans-list/loans-list.component').then(m => m.LoansListComponent),
      //   title: 'Manage Loans - Smart Library'
      // }
    ]
  },

  // Student routes - Protected with authGuard and roleGuard
  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { role: 'student' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
        title: 'Student Dashboard - Smart Library'
      },
      {
        path: 'books',
        loadComponent: () => import('./features/books/book-list/book-list.component').then(m => m.BookListComponent),
        title: 'Browse Books - Smart Library'
      },
      {
        path: 'books/:id',
        loadComponent: () => import('./features/books/book-details/book-details.component').then(m => m.BookDetailsComponent),
        title: 'Book Details - Smart Library'
      },
      // Add more student routes here as you create them
      // {
      //   path: 'books',
      //   loadComponent: () => import('./features/books/books-browse/books-browse.component').then(m => m.BooksBrowseComponent),
      //   title: 'Browse Books - Smart Library'
      // },
      // {
      //   path: 'loans',
      //   loadComponent: () => import('./features/loans/my-loans/my-loans.component').then(m => m.MyLoansComponent),
      //   title: 'My Loans - Smart Library'
      // },
      // {
      //   path: 'history',
      //   loadComponent: () => import('./features/history/loan-history/loan-history.component').then(m => m.LoanHistoryComponent),
      //   title: 'Loan History - Smart Library'
      // }
    ]
  },

  // Shared protected routes (Any authenticated user)
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-details/user-details.component').then(m => m.UserDetailsComponent),
    title: 'My Profile - Smart Library'
  },

  // Error routes (TODO: Create these components)
  // {
  //   path: 'unauthorized',
  //   loadComponent: () => import('./features/error/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
  //   title: 'Unauthorized - Smart Library'
  // },
  // {
  //   path: 'not-found',
  //   loadComponent: () => import('./features/error/not-found/not-found.component').then(m => m.NotFoundComponent),
  //   title: 'Page Not Found - Smart Library'
  // },

  // Wildcard route - redirect to login for now
  {
    path: '**',
    redirectTo: '/login'
  }
];


