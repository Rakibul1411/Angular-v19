import { Routes } from '@angular/router';
import { CounterComponent } from './counter/counter.component';
import { HelloChildComponent } from './hello-child/hello-child.component';
import { ProductsCartComponent } from './products-cart/products-cart.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/hello-child', 
    pathMatch: 'full' 
  },
  { 
    path: 'data-binding', 
    component: CounterComponent 
  },
  { 
    path: 'hello-child', 
    component: HelloChildComponent 
  },
  { 
    path: 'products-cart', 
    component: ProductsCartComponent 
  },
  { path: '**', 
    redirectTo: '/hello-child' 
  }
];
