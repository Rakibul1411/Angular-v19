import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as 'admin' | 'student';

  if (authService.hasRole(requiredRole)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
