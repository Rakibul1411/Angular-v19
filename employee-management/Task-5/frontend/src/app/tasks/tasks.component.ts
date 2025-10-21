import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';

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
  selector: 'app-tasks',
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
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})

export class TasksComponent implements OnInit {
  tasks: Task[] = [];

  showUpdateModal: boolean = false;
  selectedTask!: Task;

  constructor (
    private taskService: TaskService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
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
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Task updated successfully'
    });
  }

  confirmDelete(task: Task): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete ${task.taskName}?`,
      header: 'Delete Task',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-sm',
      accept: () => {
        this.deleteTask(task);
      }
    });
  }

  private deleteTask(task: Task): void {
    this.taskService.deleteTask(task.id);
    this.loadTasks();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Task deleted successfully'
    });
  }

}
