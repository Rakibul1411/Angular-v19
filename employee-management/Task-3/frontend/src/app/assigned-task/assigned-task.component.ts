import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee } from '../models/employee.model';
import { Task } from '../models/task.model';
import { AssignedTask } from '../models/assignedTask.model';
import { EmployeeService } from '../services/employee.service';
import { TaskService } from '../services/task.service';
import { AssignedTaskService } from '../services/assignedTask.service';
import { AvailableTasksComponent } from '../available-tasks/available-tasks.component';
import { AssignedTasksTableComponent } from '../assigned-tasks-table/assigned-tasks-table.component';

@Component({
  selector: 'app-assigned-task',
  standalone: true,
  imports: [CommonModule, FormsModule, AvailableTasksComponent, AssignedTasksTableComponent],
  templateUrl: './assigned-task.component.html',
  styleUrls: ['./assigned-task.component.css']
})
export class AssignedTaskComponent implements OnInit {
  employees: Employee[] = [];
  tasks: Task[] = [];
  selectedEmployeeId: number | null = null;
  selectedTasks: number[] = [];
  showDropdown = false;

  assignedTasks: AssignedTask[] = [];
  isEditMode = false;
  editingAssignmentId: number | null = null;

  constructor(
    private employeeService: EmployeeService,
    private taskService: TaskService,
    private assignedTaskService: AssignedTaskService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadTasks();
    this.loadAssignedTasks();
  }

  loadEmployees(): void {
    this.employees = this.employeeService.getEmployees();
  }

  loadTasks(): void {
    this.tasks = this.taskService.getTasks();
  }

  loadAssignedTasks(): void {
    this.assignedTasks = this.assignedTaskService.getAssignedTasks();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  selectEmployee(employee: Employee): void {
    this.selectedTasks = [];
    this.selectedEmployeeId = employee.id;
    this.showDropdown = false;

    this.isEditMode = false;
    this.editingAssignmentId = null;

    // Check if this employee already has assignments and populate selected tasks
    this.loadExistingAssignmentsForEmployee(employee.id);
  }

  getSelectedEmployeeName(): string {
    if (!this.selectedEmployeeId) return 'Select Employee';
    const employee = this.employees.find(emp => emp.id === this.selectedEmployeeId);
    return employee ? employee.employeeName : 'Select Employee';
  }

  loadExistingAssignmentsForEmployee(employeeId: number): void {
    const existingAssignment = this.assignedTasks.find(assignment => assignment.employeeId === employeeId);

    if (existingAssignment) {
      this.selectedTasks = existingAssignment.assignedTasks.map(task => task.id);
    }
  }

  // Event handlers for child component communications
  onTaskSelectionChange(event: {taskId: number, isChecked: boolean}): void {
    if (!this.selectedEmployeeId) {
      return;
    }

    if (event.isChecked) {
      if (!this.selectedTasks.includes(event.taskId)) {
        this.selectedTasks.push(event.taskId);
      }
    } else {
      this.selectedTasks = this.selectedTasks.filter(id => id !== event.taskId);
    }
  }

  onAssignTasks(selectedTasks: number[]): void {
    if (!this.selectedEmployeeId) {
      alert('Please select an employee first!');
      return;
    }

    if (selectedTasks.length === 0) {
      alert('Please select at least one task!');
      return;
    }

    const employee = this.employees.find(emp => emp.id === this.selectedEmployeeId);
    const selectedTaskObjects = this.tasks.filter(task => selectedTasks.includes(task.id));

    // Check if this employee already has an existing assignment
    const existingAssignment = this.assignedTasks.find(assignment => assignment.employeeId === this.selectedEmployeeId);
    const assignmentIdToUpdate = this.editingAssignmentId || (existingAssignment ? existingAssignment.id : undefined);

    this.assignedTaskService.createOrUpdateAssignment(
      this.selectedEmployeeId,
      employee!.employeeName,
      selectedTaskObjects,
      assignmentIdToUpdate
    );

    this.clearAllState();
    this.loadAssignedTasks();
  }

  onUpdateAssignment(assignment: AssignedTask): void {
    this.selectedEmployeeId = assignment.employeeId;
    this.selectedTasks = assignment.assignedTasks.map(task => task.id);
    this.isEditMode = true;
    this.editingAssignmentId = assignment.id;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDeleteAssignment(assignmentId: number): void {
    const assignment = this.assignedTaskService.getAssignmentById(assignmentId);
    if (assignment && confirm(`Are you sure you want to delete the assignment for ${assignment.employeeName}?`)) {
      const success = this.assignedTaskService.deleteAssignment(assignmentId);
      if (success) {
        if (this.editingAssignmentId === assignmentId) {
          this.onCancelEdit();
        }

        this.selectedEmployeeId = null;
        this.selectedTasks = [];
        this.loadAssignedTasks();
      } else {
        alert('Failed to delete assignment!');
      }
    }
  }

  onCancelEdit(): void {
    this.clearAllState();
  }

  clearAllState(): void {
    this.isEditMode = false;
    this.editingAssignmentId = null;
    this.selectedEmployeeId = null;
    this.selectedTasks = [];
    this.showDropdown = false;
  }
}
