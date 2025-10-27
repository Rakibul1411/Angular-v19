import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserListComponent } from './user-list/user-list.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const usersRoutes: Routes = [
  {
    path: '',
    component: UserListComponent,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id',
    component: UserProfileComponent,
    canActivate: [authGuard]
  }
];
