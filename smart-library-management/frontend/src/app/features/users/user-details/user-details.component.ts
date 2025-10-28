import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UpdateUserDto } from '../../../core/models/user.model';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ToastModule,
    SkeletonModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  user = signal<User | null>(null);
  isLoading = signal(false);
  isEditing = signal(false);
  isSaving = signal(false);
  isViewingOwnProfile = signal(false);

  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;

  userForm: FormGroup;

  roleOptions = [
    { label: 'Student', value: 'student' },
    { label: 'Admin', value: 'admin' }
  ];

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      // Admin viewing another user
      this.isViewingOwnProfile.set(false);
      this.loadUser(userId);
    } else {
      // User viewing their own profile
      this.isViewingOwnProfile.set(true);
      const currentUserId = this.currentUser()?.id;
      if (currentUserId) {
        this.loadUser(currentUserId);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Unable to load profile'
        });
        this.router.navigate(['/login']);
      }
    }
  }

  loadUser(id: string) {
    this.isLoading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.populateForm(user);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user details'
        });
        this.isLoading.set(false);
      }
    });
  }

  populateForm(user: User) {
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Disable role field for non-admin users viewing their own profile
    if (this.isViewingOwnProfile() && !this.isAdmin()) {
      this.userForm.get('role')?.disable();
    }
  }

  toggleEdit() {
    if (this.isEditing()) {
      // Cancel edit - reset form
      if (this.user()) {
        this.populateForm(this.user()!);
      }
    }
    this.isEditing.set(!this.isEditing());
  }

  saveChanges() {
    if (this.userForm.valid && this.user()) {
      this.isSaving.set(true);
      const updateData: UpdateUserDto = this.userForm.value;

      // If viewing own profile and not admin, don't allow role change
      if (this.isViewingOwnProfile() && !this.isAdmin()) {
        delete updateData.role;
      }

      const userId = this.user()?._id || this.user()?.id;

      if (!userId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User ID not found'
        });
        this.isSaving.set(false);
        return;
      }

      this.userService.updateUser(userId, updateData).subscribe({
        next: (response) => {
          this.user.set(response.data);
          this.isEditing.set(false);
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated successfully'
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update profile'
          });
          this.isSaving.set(false);
        }
      });
    }
  }

  goBack() {
    if (this.isViewingOwnProfile()) {
      // Navigate back to appropriate dashboard
      if (this.isAdmin()) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/student/dashboard']);
      }
    } else {
      // Admin viewing other user - go back to user list
      this.router.navigate(['/admin/users']);
    }
  }

  deleteUser() {
    const user = this.user();
    if (!user) return;

    const userId = user._id || user.id;
    const currentUserId = this.currentUser()?.id;

    // Prevent deleting own account
    if (userId === currentUserId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Delete',
        detail: 'You cannot delete your own account'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (userId) {
          this.userService.deleteUser(userId).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'User deleted successfully'
              });
              // Navigate back to user list
              this.router.navigate(['/admin/users']);
            },
            error: (error: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to delete user'
              });
            }
          });
        }
      }
    });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' {
    return role === 'admin' ? 'danger' : 'info';
  }

  getRoleIcon(role: string): string {
    return role === 'admin' ? 'pi pi-shield' : 'pi pi-user';
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  hasError(field: string, error: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
