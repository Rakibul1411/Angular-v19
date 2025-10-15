import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';


@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})

export class TasksComponent implements OnInit {
  tasks: Task[] = [];

  showUpdateModal: boolean = false;
  selectedTask!: Task;

  showDeleteModal: boolean = false;
  taskToDelete!: Task;

  constructor ( 
    private taskService: TaskService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.tasks = this.taskService.getTasks();
  }

  goToCreateTask(): void {
    this.router.navigate(['/create-task']);
  }

  openUpdateModal(task: Task): void {
    this.selectedTask = { ...task };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
  }

  submitUpdate(): void {
    this.taskService.updateTask(this.selectedTask, this.selectedTask.id);
    this.loadTasks();
    this.showUpdateModal = false;
  }

  confirmDelete(task: Task): void {
    this.taskToDelete = task;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  deleteTaskConfirmed(): void {
    this.taskService.deleteTask(this.taskToDelete.id);
    this.loadTasks();
    this.showDeleteModal = false;
  }

}
