import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-unauthorized',
  imports: [CardModule, ButtonModule],
  template: `
    <div class="flex align-items-center justify-content-center min-h-screen">
      <p-card [style]="{'width': '500px'}">
        <div class="text-center">
          <i class="pi pi-ban text-6xl text-red-500 mb-4"></i>
          <h1 class="text-4xl font-bold mb-3">Access Denied</h1>
          <p class="text-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p-button
            label="Go Back"
            icon="pi pi-arrow-left"
            (onClick)="goBack()"
          ></p-button>
        </div>
      </p-card>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  goBack(): void {
    // Navigate to appropriate dashboard based on user role
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.role === 'admin') {
      this.router.navigate(['/dashboard/admin']);
    } else {
      this.router.navigate(['/dashboard/student']);
    }
  }
}
