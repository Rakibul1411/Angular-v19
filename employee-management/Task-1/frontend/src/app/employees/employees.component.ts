import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];

  showUpdateModal: boolean = false;
  selectedEmployee!: Employee;

  showDeleteModal: boolean = false;
  employeeToDelete!: Employee;

  constructor ( 
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }
  
  loadEmployees(): void {
    this.employees = this.employeeService.getEmployees();
  }

  goToCreateEmployee(): void {
    this.router.navigate(['/create-employee']);
  }

  openUpdateModal(emp: Employee): void {
    this.selectedEmployee = { ...emp };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
  }

  submitUpdate(): void {
    this.employeeService.updateEmployee(this.selectedEmployee, this.selectedEmployee.id);
    this.loadEmployees();
    this.showUpdateModal = false;
  }

  confirmDelete(emp: Employee): void {
    this.employeeToDelete = emp;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  deleteEmployeeConfirmed(): void {
    this.employeeService.deleteEmployee(this.employeeToDelete.id);
    this.loadEmployees();
    this.showDeleteModal = false;
  }

}
