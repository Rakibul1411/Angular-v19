import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ToolbarModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent {
  employeeName = '';
  employeeRole = '';

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onSubmit(): void {
    const name = this.employeeName?.trim();
    const role = this.employeeRole?.trim();

    if (!name || !role) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please provide both employee name and role.'
      });
      return;
    }

    const current = this.employeeService.getEmployees();
    const newId = current.length ? Math.max(...current.map(e => e.id)) + 1 : 1;

    const newEmployee: Employee = {
      id: newId,
      employeeName: name,
      employeeRole: role
    };

    if (typeof this.employeeService.createEmployee === 'function') {
      this.employeeService.createEmployee(newEmployee);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Employee created successfully'
      });

      // Navigate after a short delay to show the toast
      setTimeout(() => {
        this.router.navigate(['/employees']);
      }, 1500);
    } else {
      console.warn('No add/create method found on EmployeeService');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to create employee. Service method not found.'
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
