import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent {
  employeeName = '';
  employeeRole = '';

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  onSubmit(): void {
    const name = this.employeeName?.trim();
    const role = this.employeeRole?.trim();

    if (!name || !role) {
      alert('Please provide employee name and role.');
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
    } else {
      console.warn('No add/create method found on EmployeeService');
    }
    this.router.navigate(['/employees']);
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}