import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, getUserId, getUserInitials, UserRole } from '../../../core/models/user.model';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Component for displaying and managing the list of users
 * Admin-only feature with search, filter, and CRUD operations
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  readonly users = signal<User[]>([]);
  readonly filteredUsers = signal<User[]>([]);
  readonly isLoading = signal(false);
  readonly searchText = signal('');
  readonly selectedRoleFilter = signal<'all' | UserRole>('all');

  // Auth state
  readonly currentUser = this.authService.currentUser;
  readonly isAdmin = this.authService.isAdmin;

  // Computed statistics
  readonly totalAdmins = computed(() =>
    this.users().filter(u => u.role === UserRole.ADMIN).length
  );
  readonly totalStudents = computed(() =>
    this.users().filter(u => u.role === UserRole.STUDENT).length
  );

  // Filter options
  readonly roleFilterOptions = [
    { label: 'All Users', value: 'all' },
    { label: 'Admins', value: UserRole.ADMIN },
    { label: 'Students', value: UserRole.STUDENT }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load all users from the API
   */
  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getAllUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.users.set(response.data);
          this.applyFilters();
          this.isLoading.set(false);
        },
        error: (error) => {
          this.showError('Failed to load users', error.message);
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Apply search and role filters to the users list
   */
  applyFilters(): void {
    let filtered = [...this.users()];

    // Apply role filter
    if (this.selectedRoleFilter() !== 'all') {
      filtered = filtered.filter(user => user.role === this.selectedRoleFilter());
    }

    // Apply search filter
    const search = this.searchText().toLowerCase();
    if (search) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    this.filteredUsers.set(filtered);
  }

  /**
   * Handle search input changes
   */
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
    this.applyFilters();
  }

  /**
   * Handle role filter changes
   */
  onRoleFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Navigate to user details view
   */
  viewUserDetails(user: User): void {
    const userId = getUserId(user);
    if (userId) {
      this.router.navigate(['/admin/users', userId]);
    }
  }

  /**
   * Navigate to user edit mode
   */
  editUser(user: User): void {
    const userId = getUserId(user);
    if (userId) {
      this.router.navigate(['/admin/users', userId]);
    }
  }

  /**
   * Delete a user with confirmation
   */
  deleteUser(user: User): void {
    const userId = getUserId(user);
    const currentUserId = this.currentUser()?.id;

    // Prevent deleting own account
    if (userId === currentUserId) {
      this.showWarning('Cannot delete own account', 'You cannot delete your own account');
      return;
    }

    // Show not implemented message
    this.messageService.add({
      severity: 'info',
      summary: 'Not Implemented',
      detail: 'Delete user functionality is not available in the backend API'
    });
  }

  /**
   * Get role severity for PrimeNG Tag component
   */
  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' {
    return role === UserRole.ADMIN ? 'danger' : 'info';
  }

  /**
   * Get role icon
   */
  getRoleIcon(role: string): string {
    return role === UserRole.ADMIN ? 'pi pi-shield' : 'pi pi-user';
  }

  /**
   * Get user initials for avatar display
   */
  getUserInitials(name: string): string {
    return getUserInitials(name);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Show success toast message
   */
  private showSuccess(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail
    });
  }

  /**
   * Show warning toast message
   */
  private showWarning(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail
    });
  }

  /**
   * Show error toast message
   */
  private showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail
    });
  }
}
