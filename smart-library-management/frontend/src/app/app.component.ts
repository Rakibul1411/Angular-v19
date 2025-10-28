import { Component, inject, signal, DestroyRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly title = 'Smart Library Management';

  // Signal to track whether to show header/footer
  readonly showLayout = signal(true);

  constructor() {
    this.initializeRouteListener();
  }

  /**
   * Listen to route changes and conditionally show/hide layout components
   * based on current route (hide for auth pages)
   */
  private initializeRouteListener(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        const isAuthPage = this.isAuthRoute(event.url);
        this.showLayout.set(!isAuthPage);
      });
  }

  /**
   * Check if the given URL is an authentication route
   */
  private isAuthRoute(url: string): boolean {
    return url.includes('/login') || url.includes('/register');
  }
}
