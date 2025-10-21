import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../models/task.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-available-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TableModule, CheckboxModule, ButtonModule, TooltipModule],
  templateUrl: './available-tasks.component.html',
  styleUrls: ['./available-tasks.component.css']
})
export class AvailableTasksComponent {
  @Input() tasks: Task[] = [];
  @Input() selectedEmployeeId: number | null = null;
  @Input() selectedTasks: number[] = [];
  @Input() isEditMode = false;

  @Output() taskSelectionChange = new EventEmitter<{taskId: number, isChecked: boolean}>();
  @Output() assignTasks = new EventEmitter<number[]>();
  @Output() cancelEdit = new EventEmitter<void>();

  onTaskCheckboxChange(taskId: number, isChecked: boolean): void {
    this.taskSelectionChange.emit({ taskId, isChecked });
  }

  isTaskSelected(taskId: number): boolean {
    return this.selectedTasks.includes(taskId);
  }

  onAssignTasks(): void {
    this.assignTasks.emit(this.selectedTasks);
  }

  onCancelEdit(): void {
    this.cancelEdit.emit();
  }
}
