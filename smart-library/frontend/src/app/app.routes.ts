import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'books',
        loadChildren: () => import('./features/books/books.routes').then(m => m.booksRoutes)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
        canActivate: [authGuard]
      },
      {
        path: 'loans',
        loadChildren: () => import('./features/loans/loans.routes').then(m => m.loansRoutes),
        canActivate: [authGuard]
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

