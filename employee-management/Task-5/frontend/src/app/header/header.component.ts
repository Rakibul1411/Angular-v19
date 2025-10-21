import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoginResponse } from '../models/auth.model';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MenubarModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: LoginResponse | null = null;
  private subscription: Subscription = new Subscription();
  items = [] as any[];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize menu items
    this.buildMenuItems();

    this.subscription.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        // update visibility dynamically
        this.buildMenuItems();
      })
    );

    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  private buildMenuItems(): void {
    this.items = [
      {
        label: 'Employees',
        routerLink: '/employees',
        visible: this.isAuthenticated,
        icon: 'pi pi-users'
      },
      {
        label: 'Tasks',
        routerLink: '/tasks',
        visible: this.isAuthenticated,
        icon: 'pi pi-list'
      },
      {
        label: 'Assigned Tasks',
        routerLink: '/assigned-tasks',
        visible: this.isAuthenticated,
        icon: 'pi pi-calendar'
      },
      {
        label: 'API Call',
        routerLink: '/app-api-call',
        visible: this.isAuthenticated,
        icon: 'pi pi-cloud'
      }
    ];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
