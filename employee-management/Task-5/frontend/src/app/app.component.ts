import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'employee-management';
  isAuthenticated = false;
  headerComponent: any = null;
  footerComponent: any = null;
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.isAuthenticated$.subscribe(async (isAuth) => {
        this.isAuthenticated = isAuth;

        if (isAuth && !this.headerComponent && !this.footerComponent) {
          await this.loadHeaderAndFooter();
        } else if (!isAuth) {
          this.headerComponent = null;
          this.footerComponent = null;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private async loadHeaderAndFooter(): Promise<void> {
    try {
      const [headerModule, footerModule] = await Promise.all([
        import('./header/header.component').then(m => m.HeaderComponent),
        import('./footer/footer.component').then(m => m.FooterComponent)
      ]);

      this.headerComponent = headerModule;
      this.footerComponent = footerModule;
    } catch (error) {
      console.error('Error loading header/footer components:', error);
    }
  }
}
