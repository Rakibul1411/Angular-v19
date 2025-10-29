import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  goBack(): void {
    const user = this.currentUser();
    if (user) {
      // Redirect to appropriate dashboard based on role
      this.router.navigate(['/app/dashboard']);
    } else {
      // If no user, go to login
      this.router.navigate(['/login']);
    }
  }

  goToLogin(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
