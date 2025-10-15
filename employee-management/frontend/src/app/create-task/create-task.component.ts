import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})

export class CreateTaskComponent {
  taskName = '';
  taskCode = '';

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  onSubmit(): void {
    const name = this.taskName?.trim();
    const code = this.taskCode?.trim();

    if (!name || !code) {
      alert('Please provide task name and code.');
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
    } else {
      console.warn('No add/create method found on TaskService');
    }
    this.router.navigate(['/tasks']);
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}
