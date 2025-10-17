import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})

export class EmployeeService {
    private employees: Employee[] = [
        { id: 1, employeeName: 'Rakibul', employeeRole: 'Developer' },
        { id: 2, employeeName: 'Rony', employeeRole: 'Designer' },
        { id: 3, employeeName: 'Saif', employeeRole: 'HR' }
    ];

    getEmployees(): Employee[] {
        return this.employees;
    }

    createEmployee(employee: Employee): void {
        this.employees.push(employee);
    }

    updateEmployee(updateEmployee: Employee, id: number): void {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.employees[index] = updateEmployee;
        }
    }

    deleteEmployee(id: number): void {
        this.employees = this.employees.filter(emp => emp.id !== id);
    }
}
