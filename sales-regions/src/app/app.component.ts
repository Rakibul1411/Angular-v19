import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SalesTerritoryComponent } from './sales-territory/sales-territory.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SalesTerritoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sales-regions';
}
