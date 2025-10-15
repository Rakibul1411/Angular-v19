import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-available-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './available-tasks.component.html',
  styleUrls: ['./available-tasks.component.css']
})
export class AvailableTasksComponent {
  @Input() tasks: Task[] = [];
  @Input() selectedEmployeeId: number | null = null;
  @Input() selectedTasks: number[] = [];

  @Output() taskSelectionChange = new EventEmitter<{taskId: number, isChecked: boolean}>();

  onTaskCheckboxChange(taskId: number, isChecked: boolean): void {
    this.taskSelectionChange.emit({ taskId, isChecked });
  }

  isTaskSelected(taskId: number): boolean {
    return this.selectedTasks.includes(taskId);
  }
}
