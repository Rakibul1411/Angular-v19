import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-create-task',
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
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})

export class CreateTaskComponent {
  taskName = '';
  taskCode = '';

  constructor(
    private taskService: TaskService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onSubmit(): void {
    const name = this.taskName?.trim();
    const code = this.taskCode?.trim();

    if (!name || !code) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please provide both task name and code.'
      });
      return;
    }

    const current = this.taskService.getTasks();
    const newId = current.length ? Math.max(...current.map(e => e.id)) + 1 : 1;

    const newTask: Task = {
      id: newId,
      taskName: name,
      taskCode: code
    };

    if (typeof this.taskService.createTask === 'function') {
      this.taskService.createTask(newTask);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Task created successfully'
      });

      // Navigate after a short delay to show the toast
      setTimeout(() => {
        this.router.navigate(['/tasks']);
      }, 1500);
    } else {
      console.warn('No add/create method found on TaskService');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to create task. Service method not found.'
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}
