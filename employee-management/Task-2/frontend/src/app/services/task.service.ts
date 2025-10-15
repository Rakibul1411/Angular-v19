import { Injectable } from "@angular/core";
import { Task } from "../models/task.model";

@Injectable({
    providedIn: 'root'
})

export class TaskService {
    private tasks: Task[] = [
        { id: 1, taskName: 'Learn Angular-19', taskCode: 'TA001' },
        { id: 2, taskName: 'Develop API', taskCode: 'TA002' },
        { id: 3, taskName: 'Implement Decorator', taskCode: 'TA003' }
    ];

    getTasks(): Task[] {
        return this.tasks;
    }

    createTask(task: Task): void {
        this.tasks.push(task);
    }

    updateTask(updatedTask: Task, id: number): void {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = updatedTask;
        }

    }

    deleteTask(id: number): void {
        this.tasks = this.tasks.filter(t => t.id !== id);
    }
}