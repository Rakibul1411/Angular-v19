import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User, UserRole, getUserInitials } from '../../../core/models/user.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  selectedRole = signal<string | null>(null);

  // Import utility function
  getUserInitials = getUserInitials;

  roleOptions = [
    { label: 'All Users', value: null },
    { label: 'Admin', value: UserRole.ADMIN },
    { label: 'Student', value: UserRole.STUDENT }
  ];

  filteredUsers = computed(() => {
    const allUsers = this.users();
    const role = this.selectedRole();

    if (!role) {
      return allUsers;
    }

    return allUsers.filter(user => user.role === role);
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        const message = error.userMessage || 'Failed to load users';
        this.errorMessage.set(message);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message
        });
      }
    });
  }

  viewUserDetails(userId: string) {
    this.router.navigate(['/app/admin/users', userId]);
  }

  editUser(event: Event, userId: string) {
    event.stopPropagation();
    this.router.navigate(['/app/admin/users', userId], {
      queryParams: { mode: 'edit' }
    });
  }

  deleteUser(event: Event, user: User) {
    event.stopPropagation();

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user._id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `${user.name} has been deleted successfully`
            });
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.userMessage || 'Failed to delete user'
            });
          }
        });
      }
    });
  }

  onRoleFilterChange(role: string | null) {
    this.selectedRole.set(role);
  }

  clearFilter() {
    this.selectedRole.set(null);
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }
}
