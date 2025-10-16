import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignedTask } from '../models/assignedTask.model';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-assigned-tasks-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assigned-tasks-table.component.html',
  styleUrls: ['./assigned-tasks-table.component.css']
})
export class AssignedTasksTableComponent {
  @Input() assignedTasks: AssignedTask[] = [];
  @Input() isEditMode = false;
  @Input() editingAssignmentId: number | null = null;

  @Output() updateAssignment = new EventEmitter<AssignedTask>();
  @Output() deleteAssignment = new EventEmitter<number>();

  onUpdateAssignment(assignment: AssignedTask): void {
    this.updateAssignment.emit(assignment);
  }

  onDeleteAssignment(assignmentId: number): void {
    this.deleteAssignment.emit(assignmentId);
  }

  getAssignedTasksString(assignedTasks: Task[]): string {
    return assignedTasks.map(task => task.taskName).join(', ');
  }
}
