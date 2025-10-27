import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenubarModule,
    AvatarModule,
    TooltipModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);

  currentUser = this.authService.currentUserValue;
  isLoggedIn = this.authService.isAuthenticated;

  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.updateMenuItems();

    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = this.authService.isAuthenticated;
      this.updateMenuItems();
    });
  }

  updateMenuItems() {
    if (!this.isLoggedIn) {
      this.menuItems = [
        {
          label: 'Home',
          icon: 'pi pi-home',
          command: () => this.router.navigate(['/auth/login'])
        },
        {
          label: 'Login',
          icon: 'pi pi-sign-in',
          command: () => this.router.navigate(['/auth/login'])
        },
        {
          label: 'Register',
          icon: 'pi pi-user-plus',
          command: () => this.router.navigate(['/auth/register'])
        }
      ];
    } else {
      const dashboardPath = this.currentUser?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student';

      this.menuItems = [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          command: () => this.router.navigate([dashboardPath])
        },
        {
          label: 'Books',
          icon: 'pi pi-book',
          command: () => this.router.navigate(['/books'])
        },
        {
          label: 'Loans',
          icon: 'pi pi-shopping-cart',
          items: [
            {
              label: 'My Loans',
              icon: 'pi pi-list',
              command: () => this.router.navigate(['/loans'])
            },
            {
              label: 'Issue Book',
              icon: 'pi pi-plus',
              command: () => this.router.navigate(['/loans/issue'])
            },
            {
              label: 'Loan History',
              icon: 'pi pi-history',
              command: () => this.router.navigate(['/loans/history'])
            },
            ...(this.currentUser?.role === 'admin' ? [{
              label: 'Overdue Loans',
              icon: 'pi pi-exclamation-triangle',
              command: () => this.router.navigate(['/loans/overdue'])
            }] : [])
          ]
        }
      ];

      // Admin-only menu items
      if (this.currentUser?.role === 'admin') {
        this.menuItems.push({
          label: 'Users',
          icon: 'pi pi-users',
          command: () => this.router.navigate(['/users'])
        });
      }
    }
  }

  navigateToProfile() {
    this.router.navigate(['/users/profile']);
  }

  logout() {
    this.authService.logout();
  }

  getDashboardRoute(): string {
    return this.currentUser?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student';
  }

  getUserInitial(): string {
    return this.currentUser?.name ? this.currentUser.name.charAt(0).toUpperCase() : 'U';
  }
}
