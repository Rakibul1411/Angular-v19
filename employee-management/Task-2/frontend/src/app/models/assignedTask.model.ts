import { Task } from './task.model';

export interface AssignedTask {
  id: number;
  employeeId: number;
  employeeName: string;
  assignedTasks: Task[];
}   
