import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../models/employee.model';
import { Task } from '../models/task.model';

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
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private fb: FormBuilder) {
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
    this.http.get<Employee[]>(`${this.apiUrl}/employees`).subscribe(data => {
      this.employees = data;
    });
  }

  loadTasks(): void {
    this.http.get<Task[]>(`${this.apiUrl}/tasks`).subscribe(data => {
      this.tasks = data;
    });
  }

  createEmployee(): void {
    if (this.employeeForm.valid) {
      const newEmployee: Omit<Employee, 'id'> = this.employeeForm.value;
      this.http.post<Employee>(`${this.apiUrl}/employees`, newEmployee).subscribe(() => {
        this.loadEmployees();
        this.employeeForm.reset();
      });
    }
  }

  updateEmployee(): void {
    if (this.selectedEmployee && this.employeeForm.valid) {
      const updatedEmployee: Employee = { ...this.selectedEmployee, ...this.employeeForm.value };
      this.http.put<Employee>(`${this.apiUrl}/employees/${this.selectedEmployee.id}`, updatedEmployee).subscribe(() => {
        this.loadEmployees();
        this.selectedEmployee = null;
        this.employeeForm.reset();
      });
    }
  }

  deleteEmployee(id: number): void {
    this.http.delete(`${this.apiUrl}/employees/${id}`).subscribe(() => {
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
      this.http.post<Task>(`${this.apiUrl}/tasks`, newTask).subscribe(() => {
        this.loadTasks();
        this.taskForm.reset();
      });
    }
  }

  updateTask(): void {
    if (this.selectedTask && this.taskForm.valid) {
      const updatedTask: Task = { ...this.selectedTask, ...this.taskForm.value };
      this.http.put<Task>(`${this.apiUrl}/tasks/${this.selectedTask.id}`, updatedTask).subscribe(() => {
        this.loadTasks();
        this.selectedTask = null;
        this.taskForm.reset();
      });
    }
  }

  deleteTask(id: number): void {
    this.http.delete(`${this.apiUrl}/tasks/${id}`).subscribe(() => {
      this.loadTasks();
    });
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.taskForm.patchValue(task);
  }
}
