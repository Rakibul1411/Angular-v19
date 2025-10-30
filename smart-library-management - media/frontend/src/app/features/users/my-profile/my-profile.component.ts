import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User, getUserInitials } from '../../../core/models/user.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  currentUser = this.authService.currentUser;
  user = signal<User | null>(null);
  isLoading = signal(false);
  isEditMode = signal(false);
  isSaving = signal(false);

  // Import utility function
  getUserInitials = getUserInitials;

  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const currentUser = this.currentUser();
    if (!currentUser) return;

    this.isLoading.set(true);

    this.userService.getUserById(currentUser.id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load profile'
        });
        this.isLoading.set(false);
      }
    });
  }

  toggleEditMode() {
    this.isEditMode.update(mode => !mode);
    if (!this.isEditMode()) {
      const user = this.user();
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      }
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isSaving.set(true);
      const userId = this.user()?._id;

      if (!userId) return;

      const updateData = {
        name: this.profileForm.value.name,
        email: this.profileForm.value.email
      };

      this.userService.updateUser(userId, updateData).subscribe({
        next: (response) => {
          this.user.set(response.data);
          this.isEditMode.set(false);
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated successfully'
          });
        },
        error: (error) => {
          this.isSaving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || 'Failed to update profile'
          });
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }
}
