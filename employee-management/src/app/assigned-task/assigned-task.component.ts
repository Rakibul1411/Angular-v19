import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee } from '../models/employee.model';
import { Task } from '../models/task.model';
import { EmployeeService } from '../services/employee.service';
import { TaskService } from '../services/task.service';

// Interface for assigned task records
interface AssignedTask {
  id: number;
  employeeId: number;
  employeeName: string;
  assignedTasks: Task[];
}

@Component({
  selector: 'app-assigned-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assigned-task.component.html',
  styleUrls: ['./assigned-task.component.css']
})
export class AssignedTaskComponent implements OnInit {
  employees: Employee[] = [];
  tasks: Task[] = [];
  selectedEmployeeId: number | null = null;
  selectedTasks: number[] = [];
  showDropdown = false;
  
  // Assignment storage and management
  assignedTasks: AssignedTask[] = [];
  isEditMode = false;
  editingAssignmentId: number | null = null;

  constructor(
    private employeeService: EmployeeService,
    private taskService: TaskService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadTasks();
  }

  loadEmployees(): void {
    this.employees = this.employeeService.getEmployees();
  }

  loadTasks(): void {
    this.tasks = this.taskService.getTasks();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  selectEmployee(employee: Employee): void {
    // Clear previously selected tasks when changing employee
    if (this.selectedEmployeeId !== employee.id) {
      this.selectedTasks = [];
    }
    this.selectedEmployeeId = employee.id;
    this.showDropdown = false;
  }

  getSelectedEmployeeName(): string {
    if (!this.selectedEmployeeId) return 'Select Employee';
    const employee = this.employees.find(emp => emp.id === this.selectedEmployeeId);
    return employee ? employee.employeeName : 'Select Employee';
  }

  onTaskCheckboxChange(taskId: number, isChecked: boolean): void {
    // Don't allow task selection if no employee is selected
    if (!this.selectedEmployeeId) {
      return;
    }

    if (isChecked) {
      if (!this.selectedTasks.includes(taskId)) {
        this.selectedTasks.push(taskId);
      }
    } else {
      this.selectedTasks = this.selectedTasks.filter(id => id !== taskId);
    }
  }

  isTaskSelected(taskId: number): boolean {
    return this.selectedTasks.includes(taskId);
  }

  assignTasks(): void {
    if (!this.selectedEmployeeId) {
      alert('Please select an employee first!');
      return;
    }

    if (this.selectedTasks.length === 0) {
      alert('Please select at least one task!');
      return;
    }

    const employee = this.employees.find(emp => emp.id === this.selectedEmployeeId);
    const selectedTaskObjects = this.tasks.filter(task => this.selectedTasks.includes(task.id));

    if (this.isEditMode && this.editingAssignmentId) {
      // Update existing assignment
      const existingIndex = this.assignedTasks.findIndex(at => at.id === this.editingAssignmentId);
      if (existingIndex !== -1) {
        this.assignedTasks[existingIndex] = {
          id: this.editingAssignmentId,
          employeeId: this.selectedEmployeeId,
          employeeName: employee!.employeeName,
          assignedTasks: selectedTaskObjects
        };
      }
      this.isEditMode = false;
      this.editingAssignmentId = null;
      alert('Assignment updated successfully!');
    } else {
      // Check if employee already has assignments
      const existingAssignment = this.assignedTasks.find(at => at.employeeId === this.selectedEmployeeId);
      
      if (existingAssignment) {
        // Update existing employee's tasks (merge)
        const newTasks = selectedTaskObjects.filter(task => 
          !existingAssignment.assignedTasks.some(existing => existing.id === task.id)
        );
        existingAssignment.assignedTasks.push(...newTasks);
        alert('Tasks added to existing assignment!');
      } else {
        // Create new assignment
        const newAssignment: AssignedTask = {
          id: this.assignedTasks.length > 0 ? Math.max(...this.assignedTasks.map(at => at.id)) + 1 : 1,
          employeeId: this.selectedEmployeeId,
          employeeName: employee!.employeeName,
          assignedTasks: selectedTaskObjects
        };
        this.assignedTasks.push(newAssignment);
      }
    }

    // Clear selections
    this.selectedEmployeeId = null;
    this.selectedTasks = [];
  }

  // Get assigned tasks as comma-separated string
  getAssignedTasksString(assignedTasks: Task[]): string {
    return assignedTasks.map(task => task.taskName).join(', ');
  }

  // Update assignment - populate form with existing data
  updateAssignment(assignment: AssignedTask): void {
    this.selectedEmployeeId = assignment.employeeId;
    this.selectedTasks = assignment.assignedTasks.map(task => task.id);
    this.isEditMode = true;
    this.editingAssignmentId = assignment.id;
    
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete assignment
  deleteAssignment(assignmentId: number): void {
    const assignment = this.assignedTasks.find(at => at.id === assignmentId);
    if (assignment && confirm(`Are you sure you want to delete the assignment for ${assignment.employeeName}?`)) {
      this.assignedTasks = this.assignedTasks.filter(at => at.id !== assignmentId);
      alert('Assignment deleted successfully!');
    }
  }

  // Cancel edit mode
  cancelEdit(): void {
    this.isEditMode = false;
    this.editingAssignmentId = null;
    this.selectedEmployeeId = null;
    this.selectedTasks = [];
  }
}
