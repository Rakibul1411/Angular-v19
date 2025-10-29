import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private authService = inject(AuthService);

  // Input/Output properties
  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  // Get current user
  currentUser = this.authService.currentUser;

  // Computed menu items based on role
  menuItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    const role = user.role;

    if (role === UserRole.ADMIN) {
      return [
        { label: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/app/dashboard' },
        { label: 'All Users', icon: 'fas fa-users', route: '/app/admin/users' },
        { label: 'All Books', icon: 'fas fa-book', route: '/app/admin/books' },
        { label: 'All Loans', icon: 'fas fa-exchange-alt', route: '/app/admin/loans' },
        { label: 'My Profile', icon: 'fas fa-user-circle', route: '/app/admin/profile' }
      ];
    } else if (role === UserRole.STUDENT) {
      return [
        { label: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/app/dashboard' },
        { label: 'All Books', icon: 'fas fa-book', route: '/app/student/books' },
        { label: 'My Loans', icon: 'fas fa-bookmark', route: '/app/student/loans' },
        { label: 'My Profile', icon: 'fas fa-user', route: '/app/student/profile' }
      ];
    } else {
      return [];
    }
  });

  handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.closeSidebar.emit();
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.closeSidebar.emit();
      }
    });
  }
}
