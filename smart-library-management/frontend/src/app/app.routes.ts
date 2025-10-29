import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Protected routes (with layout)
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Admin-only routes
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { role: UserRole.ADMIN },
        children: [
          {
            path: 'users',
            loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
          },
          {
            path: 'users/:id',
            loadComponent: () => import('./features/users/user-details/user-details.component').then(m => m.UserDetailsComponent)
          },
          {
            path: 'profile',
            loadComponent: () => import('./features/users/my-profile/my-profile.component').then(m => m.MyProfileComponent)
          },
          {
            path: 'books',
            loadComponent: () => import('./features/books/book-list/book-list.component').then(m => m.BookListComponent)
          },
          {
            path: 'books/add',
            loadComponent: () => import('./features/books/add-book/add-book.component').then(m => m.AddBookComponent)
          },
          {
            path: 'books/:id',
            loadComponent: () => import('./features/books/book-details/book-details.component').then(m => m.BookDetailsComponent)
          }
        ]
      },

      // Student-only routes
      {
        path: 'student',
        canActivate: [roleGuard],
        data: { role: UserRole.STUDENT },
        children: [
          {
            path: 'profile',
            loadComponent: () => import('./features/users/my-profile/my-profile.component').then(m => m.MyProfileComponent)
          },
          {
            path: 'books',
            loadComponent: () => import('./features/books/book-list/book-list.component').then(m => m.BookListComponent)
          },
          {
            path: 'books/:id',
            loadComponent: () => import('./features/books/book-details/book-details.component').then(m => m.BookDetailsComponent)
          }
        ]
      }
    ]
  },

  // Fallback route
  { path: '**', redirectTo: '/login' }
];


