import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.css'
})
export class CounterComponent {
  title: string = 'Counter App';


  count1: number = 0;
  count2: any;
  count3: any = 'Hello';

  // Property binding
  propertyIncrement() {
    this.count1++;
  }

  propertyDecrement() {
    if (this.count1 > 0) {
      this.count1--;
    }
  }

  propertyReset() {
    this.count1 = 0;
  }

  // Event binding
  eventChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.count2 = input.value;
  }

  // Two-way binding
  twoWayBindingChange(event: any) {
    this.count3 = event.target.value;
  }

}
