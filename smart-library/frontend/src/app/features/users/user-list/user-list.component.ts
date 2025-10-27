import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  users: User[] = [];
  loading = false;
  selectedRole: string | null = null;

  roleOptions = [
    { label: 'All Users', value: null },
    { label: 'Students', value: 'student' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Admins', value: 'admin' }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    if (this.selectedRole) {
      this.userService.getUsersByRole(this.selectedRole).subscribe({
        next: (response) => {
          this.users = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load users'
          });
        }
      });
    } else {
      this.userService.getAllUsers().subscribe({
        next: (response) => {
          this.users = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load users'
          });
        }
      });
    }
  }

  onRoleFilterChange(): void {
    this.loadUsers();
  }

  viewProfile(user: User): void {
    const userId = user._id || user.id;
    if (userId) {
      this.router.navigate(['/users', userId]);
    }
  }

  editUser(user: User): void {
    const userId = user._id || user.id;
    if (userId) {
      this.router.navigate(['/users/edit', userId]);
    }
  }

  deleteUser(user: User): void {
    const userId = user._id || user.id;
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User ID not found'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted successfully'
            });
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete user'
            });
          }
        });
      }
    });
  }

  getRoleSeverity(role: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (role) {
      case 'admin': return 'danger';
      case 'faculty': return 'info';
      case 'student': return 'success';
      default: return 'secondary';
    }
  }

  goToDashboard(): void {
    // Navigate to admin dashboard (user management is admin-only)
    this.router.navigate(['/dashboard/admin']);
  }
}
