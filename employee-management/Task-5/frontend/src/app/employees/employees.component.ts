import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    ToolbarModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];

  showUpdateModal: boolean = false;
  selectedEmployee!: Employee;

  constructor (
    private employeeService: EmployeeService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
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
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Employee updated successfully'
    });
  }

  confirmDelete(emp: Employee): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete ${emp.employeeName}?`,
      header: 'Delete Employee',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-sm',
      accept: () => {
        this.deleteEmployee(emp);
      }
    });
  }

  private deleteEmployee(emp: Employee): void {
    this.employeeService.deleteEmployee(emp.id);
    this.loadEmployees();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Employee deleted successfully'
    });
  }

}
