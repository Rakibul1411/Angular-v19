import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const dashboardRoutes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard(['admin'])]
  },
  {
    path: 'student',
    loadComponent: () => import('./student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
    canActivate: [roleGuard(['student', 'faculty', 'admin'])]
  },
  {
    path: '',
    redirectTo: 'student',
    pathMatch: 'full'
  }
];
