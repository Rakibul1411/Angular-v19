import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  @Input() title: string = 'Smart Library Management';
  @Input() subtitle: string = '';
  @Input() showBackButton: boolean = false;
  @Input() backRoute: string = '/';
  @Input() showFooter: boolean = true;
}
