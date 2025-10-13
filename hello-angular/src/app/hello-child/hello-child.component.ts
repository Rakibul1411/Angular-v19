import { Component } from '@angular/core';

@Component({
  selector: 'app-hello-child',
  standalone: true,
  imports: [],
  templateUrl: './hello-child.component.html',
  styleUrl: './hello-child.component.css'
})
export class HelloChildComponent {
  message: string = "Hello from Child Component!";
}
