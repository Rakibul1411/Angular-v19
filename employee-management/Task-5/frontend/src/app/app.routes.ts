import { Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: '/employees',
    pathMatch: 'full'
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'create-employee',
    loadComponent: () => import('./create-employee/create-employee.component').then(m => m.CreateEmployeeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'app-api-call',
    loadComponent: () => import('./api-call/api-call.component').then(m => m.ApiCallComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'create-task',
    loadComponent: () => import('./create-task/create-task.component').then(m => m.CreateTaskComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'assigned-tasks',
    loadComponent: () => import('./assigned-task/assigned-task.component').then(m => m.AssignedTaskComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
