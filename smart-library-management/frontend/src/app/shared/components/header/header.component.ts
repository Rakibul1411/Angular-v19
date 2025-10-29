import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { getUserInitials } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private authService = inject(AuthService);

  // Output event to parent component
  toggleSidebar = output<void>();

  // Get current user from auth service
  currentUser = this.authService.currentUser;

  // Helper function for initials
  getUserInitials = getUserInitials;
}
