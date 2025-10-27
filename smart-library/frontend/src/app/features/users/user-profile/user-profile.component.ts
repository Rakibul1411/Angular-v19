import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    ButtonModule,
    TagModule,
    ToastModule,
    SkeletonModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  user: User | null = null;
  userForm: FormGroup;
  loading = false;
  saving = false;
  userId: string | null = null;
  isEditMode = false;

  roles = [
    { label: 'Student', value: 'student' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Admin', value: 'admin' }
  ];

  get currentUser() {
    return this.authService.currentUserValue;
  }

  get isAdmin(): boolean {
    return this.authService.hasRole(['admin']);
  }

  get isOwnProfile(): boolean {
    const currentUserId = this.currentUser?.id || this.currentUser?._id;
    return this.userId === currentUserId;
  }

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: [{ value: 'student', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');

    if (!this.userId) {
      // If no ID in route, use current user's ID
      this.userId = this.currentUser?.id || this.currentUser?._id || null;
    }

    if (this.userId) {
      this.loadUser(this.userId);
    } else {
      // No user ID available - show error
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to load user profile'
      });
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });

        if (this.isAdmin) {
          this.userForm.get('role')?.enable();
        }

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user profile'
        });
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.loadUser(this.userId!);
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid || !this.userId) {
      return;
    }

    this.saving = true;
    const updateData: any = {
      name: this.userForm.value.name,
      email: this.userForm.value.email
    };

    if (this.userForm.value.password) {
      updateData.password = this.userForm.value.password;
    }

    if (this.isAdmin) {
      updateData.role = this.userForm.value.role;
    }

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: () => {
        this.saving = false;
        this.isEditMode = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully'
        });
        this.loadUser(this.userId!);
      },
      error: (error) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Failed to update profile'
        });
      }
    });
  }

  goBack(): void {
    // If admin viewing another user's profile, go back to users list
    // Otherwise, go back to dashboard
    if (this.isAdmin && !this.isOwnProfile) {
      this.router.navigate(['/users']);
    } else {
      // Navigate to appropriate dashboard based on user role
      if (this.isAdmin) {
        this.router.navigate(['/dashboard/admin']);
      } else {
        this.router.navigate(['/dashboard/student']);
      }
    }
  }

  getRoleSeverity(role: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (role) {
      case 'admin': return 'danger';
      case 'faculty': return 'info';
      case 'student': return 'success';
      default: return 'secondary';
    }
  }

  get name() {
    return this.userForm.get('name');
  }

  get email() {
    return this.userForm.get('email');
  }

  get password() {
    return this.userForm.get('password');
  }
}
