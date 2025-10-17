import { Injectable } from '@angular/core';
import { AssignedTask } from '../models/assignedTask.model';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})

export class AssignedTaskService {
  private assignedTasks: AssignedTask[] = [];

  constructor() { }

  getAssignedTasks(): AssignedTask[] {
    return this.assignedTasks;
  }

  createOrUpdateAssignment(employeeId: number, employeeName: string, selectedTasks: Task[], editingAssignmentId?: number): string {
    if (editingAssignmentId) {
      const existingIndex = this.assignedTasks.findIndex(at => at.id === editingAssignmentId);
      if (existingIndex !== -1) {
        this.assignedTasks[existingIndex] = {
          id: editingAssignmentId,
          employeeId: employeeId,
          employeeName: employeeName,
          assignedTasks: selectedTasks
        };
        return 'Assignment updated successfully!';
      }
      return 'Assignment not found!';
    } else {
      const existingAssignment = this.assignedTasks.find(at => at.employeeId === employeeId);

      if (existingAssignment) {
        const newTasks = selectedTasks.filter(task =>
          !existingAssignment.assignedTasks.some(existing => existing.id === task.id)
        );
        existingAssignment.assignedTasks.push(...newTasks);
        return 'Tasks added to existing assignment!';
      } else {
        const newAssignment: AssignedTask = {
          id: this.assignedTasks.length > 0 ? Math.max(...this.assignedTasks.map(at => at.id)) + 1 : 1,
          employeeId: employeeId,
          employeeName: employeeName,
          assignedTasks: selectedTasks
        };
        this.assignedTasks.push(newAssignment);
        return 'Tasks assigned successfully!';
      }
    }
  }

  deleteAssignment(assignmentId: number): boolean {
    const initialLength = this.assignedTasks.length;
    this.assignedTasks = this.assignedTasks.filter(at => at.id !== assignmentId);
    return this.assignedTasks.length < initialLength;
  }

  getAssignmentById(assignmentId: number): AssignedTask | undefined {
    return this.assignedTasks.find(at => at.id === assignmentId);
  }

  getAssignmentsByEmployee(employeeId: number): AssignedTask[] {
    return this.assignedTasks.filter(at => at.employeeId === employeeId);
  }

  getAssignedTasksString(assignedTasks: Task[]): string {
    return assignedTasks.map(task => task.taskName).join(', ');
  }

  clearAllAssignments(): void {
    this.assignedTasks = [];
  }

  getAssignmentCount(): number {
    return this.assignedTasks.length;
  }
}
