import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { BookListComponent } from './book-list/book-list.component';
import { BookDetailsComponent } from './book-details/book-details.component';
import { BookFormComponent } from './book-form/book-form.component';

export const booksRoutes: Routes = [
  {
    path: '',
    component: BookListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'add',
    component: BookFormComponent,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'edit/:id',
    component: BookFormComponent,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: ':id',
    component: BookDetailsComponent,
    canActivate: [authGuard]
  }
];
