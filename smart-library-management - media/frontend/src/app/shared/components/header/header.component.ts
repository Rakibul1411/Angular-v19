import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getUserInitials } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Output event to parent component
  toggleSidebar = output<void>();

  // Get current user from auth service
  currentUser = this.authService.currentUser;

  // Profile menu state
  isProfileMenuOpen = signal(false);

  // Helper function for initials
  getUserInitials = getUserInitials;

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(value => !value);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  handleLogout(): void {
    this.closeProfileMenu();
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
