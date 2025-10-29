import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User, UserRole, getUserInitials } from '../../../core/models/user.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  currentUser = this.authService.currentUser;
  user = signal<User | null>(null);
  isLoading = signal(false);
  isEditMode = signal(false);
  isSaving = signal(false);

  // Import utility function
  getUserInitials = getUserInitials;

  userForm: FormGroup;

  roleOptions = [
    { label: 'Student', value: UserRole.STUDENT },
    { label: 'Admin', value: UserRole.ADMIN }
  ];

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'edit') {
        this.isEditMode.set(true);
      }
    });

    const userId = this.route.snapshot.paramMap.get('id');

    if (userId) {
      this.loadUserById(userId);
    }
  }

  loadUserById(userId: string) {
    this.isLoading.set(true);

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load user details'
        });
        this.isLoading.set(false);
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === UserRole.ADMIN;
  }

  toggleEditMode() {
    this.isEditMode.update(mode => !mode);
    if (!this.isEditMode()) {
      const user = this.user();
      if (user) {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });
      }
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isSaving.set(true);
      const userId = this.user()?._id;

      if (!userId) return;

      this.userService.updateUser(userId, this.userForm.value).subscribe({
        next: (response) => {
          this.user.set(response.data);
          this.isEditMode.set(false);
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User updated successfully'
          });
        },
        error: (error) => {
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.userMessage || 'Failed to update user'
          });
        }
      });
    }
  }

  deleteUser() {
    const user = this.user();
    if (!user) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted successfully'
            });
            setTimeout(() => {
              this.router.navigate(['/app/admin/users']);
            }, 1500);
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

  goBack() {
    this.router.navigate(['/app/admin/users']);
  }

  getRoleBadgeClass(role: string): string {
    return role === UserRole.ADMIN
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }
}
