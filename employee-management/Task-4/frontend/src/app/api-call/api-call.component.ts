import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../models/employee.model';
import { Task } from '../models/task.model';
import { ApiCallService } from '../services/api-call.service';

@Component({
  selector: 'app-api-call',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './api-call.component.html',
  styleUrls: ['./api-call.component.css']
})
export class ApiCallComponent implements OnInit {
  employees: Employee[] = [];
  tasks: Task[] = [];
  employeeForm: FormGroup;
  taskForm: FormGroup;
  selectedEmployee: Employee | null = null;
  selectedTask: Task | null = null;

  constructor(private apiCallService: ApiCallService, private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      employeeName: ['', Validators.required],
      employeeRole: ['', Validators.required]
    });
    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      taskCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadTasks();
  }

  loadEmployees(): void {
    this.apiCallService.getEmployees().subscribe((data: Employee[]) => {
      this.employees = data;
    });
  }

  loadTasks(): void {
    this.apiCallService.getTasks().subscribe((data: Task[]) => {
      this.tasks = data;
    });
  }

  createEmployee(): void {
    if (this.employeeForm.valid) {
      const newEmployee: Omit<Employee, 'id'> = this.employeeForm.value;
      this.apiCallService.createEmployee(newEmployee).subscribe(() => {
        this.loadEmployees();
        this.employeeForm.reset();
      });
    }
  }

  updateEmployee(): void {
    if (this.selectedEmployee && this.employeeForm.valid) {
      const updatedEmployee: Employee = { ...this.selectedEmployee, ...this.employeeForm.value };
      this.apiCallService.updateEmployee(updatedEmployee).subscribe(() => {
        this.loadEmployees();
        this.selectedEmployee = null;
        this.employeeForm.reset();
      });
    }
  }

  deleteEmployee(id: number): void {
    this.apiCallService.deleteEmployee(id).subscribe(() => {
      this.loadEmployees();
    });
  }

  selectEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.employeeForm.patchValue(employee);
  }

  createTask(): void {
    if (this.taskForm.valid) {
      const newTask: Omit<Task, 'id'> = this.taskForm.value;
      this.apiCallService.createTask(newTask).subscribe(() => {
        this.loadTasks();
        this.taskForm.reset();
      });
    }
  }

  updateTask(): void {
    if (this.selectedTask && this.taskForm.valid) {
      const updatedTask: Task = { ...this.selectedTask, ...this.taskForm.value };
      this.apiCallService.updateTask(updatedTask).subscribe(() => {
        this.loadTasks();
        this.selectedTask = null;
        this.taskForm.reset();
      });
    }
  }

  deleteTask(id: number): void {
    this.apiCallService.deleteTask(id).subscribe(() => {
      this.loadTasks();
    });
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.taskForm.patchValue(task);
  }
}
