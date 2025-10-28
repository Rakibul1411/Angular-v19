import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth-response.model';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    CardModule,
    CheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  returnUrl: string = '/';

  constructor() {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Initialize the login form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { rememberMe, ...credentials } = this.loginForm.value;
      const loginRequest: LoginRequest = credentials;

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.isLoading.set(false);

          // Navigate based on user role and return URL
          if (this.returnUrl && this.returnUrl !== '/') {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            // Default navigation based on role
            if (response.user.role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/student/dashboard']);
            }
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.error?.message || 'Login failed. Please check your credentials.'
          );
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // Helper methods for template
  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
