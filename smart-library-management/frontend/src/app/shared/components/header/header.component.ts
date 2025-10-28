import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Dynamic properties that update based on current route
  title: string = 'Smart Library Management';
  subtitle: string = '';
  showBackButton: boolean = false;
  backRoute: string = '/';

  readonly currentUser = this.authService.currentUser;
  readonly isAdmin = this.authService.isAdmin;

  userMenuItems: MenuItem[] = [
    {
      label: 'My Profile',
      icon: 'pi pi-user',
      command: () => this.navigateToProfile()
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.navigateToSettings()
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  ngOnInit(): void {
    // Update header based on current route
    this.updateHeaderForCurrentRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateHeaderForCurrentRoute(event.url);
      });
  }

  /**
   * Update header title, subtitle, and back button based on current route
   */
  private updateHeaderForCurrentRoute(url: string): void {
    const isAdmin = this.isAdmin();

    // Admin routes
    if (url.includes('/admin/dashboard')) {
      this.title = 'Admin Dashboard';
      this.subtitle = 'Manage your library system';
      this.showBackButton = false;
    } else if (url.includes('/admin/users/') && !url.includes('/admin/users')) {
      this.title = 'User Details';
      this.subtitle = 'View and manage user information';
      this.showBackButton = true;
      this.backRoute = '/admin/users';
    } else if (url.includes('/admin/users')) {
      this.title = 'User Management';
      this.subtitle = 'Manage library users and roles';
      this.showBackButton = true;
      this.backRoute = '/admin/dashboard';
    } else if (url.includes('/admin/books/new')) {
      this.title = 'Add New Book';
      this.subtitle = 'Add a new book to the library';
      this.showBackButton = true;
      this.backRoute = '/admin/books';
    } else if (url.includes('/admin/books/') && url.includes('/edit')) {
      this.title = 'Edit Book';
      this.subtitle = 'Update book information';
      this.showBackButton = true;
      this.backRoute = '/admin/books';
    } else if (url.includes('/admin/books/')) {
      this.title = 'Book Details';
      this.subtitle = 'View book information';
      this.showBackButton = true;
      this.backRoute = '/admin/books';
    } else if (url.includes('/admin/books')) {
      this.title = 'Manage Books';
      this.subtitle = 'Add, edit, or remove books from the library';
      this.showBackButton = true;
      this.backRoute = '/admin/dashboard';
    }
    // Student routes
    else if (url.includes('/student/dashboard')) {
      this.title = 'Student Dashboard';
      this.subtitle = 'Smart Library Management';
      this.showBackButton = false;
    } else if (url.includes('/student/books/')) {
      this.title = 'Book Details';
      this.subtitle = 'View book information';
      this.showBackButton = true;
      this.backRoute = '/student/books';
    } else if (url.includes('/student/books')) {
      this.title = 'Browse Books';
      this.subtitle = 'Browse and search available books';
      this.showBackButton = true;
      this.backRoute = '/student/dashboard';
    }
    // Profile route
    else if (url.includes('/profile')) {
      this.title = 'My Profile';
      this.subtitle = 'View and manage your profile';
      this.showBackButton = true;
      this.backRoute = isAdmin ? '/admin/dashboard' : '/student/dashboard';
    }
    // Default
    else {
      this.title = 'Smart Library Management';
      this.subtitle = '';
      this.showBackButton = false;
    }
  }

  goBack(): void {
    this.router.navigate([this.backRoute]);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    // TODO: Navigate to settings when implemented
    console.log('Settings coming soon!');
  }

  logout(): void {
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
