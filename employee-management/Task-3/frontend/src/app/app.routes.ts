import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/employees',
    pathMatch: 'full'
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent)
  },
  {
    path: 'create-employee',
    loadComponent: () => import('./create-employee/create-employee.component').then(m => m.CreateEmployeeComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks.component').then(m => m.TasksComponent)
  },
  {
    path: 'app-api-call',
    loadComponent: () => import('./api-call/api-call.component').then(m => m.ApiCallComponent)
  },
  {
    path: 'create-task',
    loadComponent: () => import('./create-task/create-task.component').then(m => m.CreateTaskComponent)
  },
  {
    path: 'assigned-tasks',
    loadComponent: () => import('./assigned-task/assigned-task.component').then(m => m.AssignedTaskComponent)
  },
  {
    path: '**',
    redirectTo: '/employees'
  }
];
