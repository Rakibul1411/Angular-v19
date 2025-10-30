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

      // Shared routes (accessible by both admin and student)
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
      },

      // AV/Communication routes (accessible by all logged-in users)
      {
        path: 'av-communications',
        loadComponent: () => import('./features/av-communications/av-communication-list/av-communication-list.component').then(m => m.AVCommunicationListComponent)
      },
      {
        path: 'av-communications/create',
        loadComponent: () => import('./features/av-communications/av-communication-form/av-communication-form.component').then(m => m.AVCommunicationFormComponent)
      },
      {
        path: 'av-communications/edit/:id',
        loadComponent: () => import('./features/av-communications/av-communication-form/av-communication-form.component').then(m => m.AVCommunicationFormComponent)
      },
      {
        path: 'av-communications/:id',
        loadComponent: () => import('./features/av-communications/av-communication-details/av-communication-details.component').then(m => m.AVCommunicationDetailsComponent)
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
            path: 'books/add',
            loadComponent: () => import('./features/books/add-book/add-book.component').then(m => m.AddBookComponent)
          }
        ]
      }
    ]
  },

  // Fallback route
  { path: '**', redirectTo: '/login' }
];


