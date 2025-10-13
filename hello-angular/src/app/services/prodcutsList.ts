import { Injectable } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  unitPrice: number;
  availableQuantity: number;
}

export interface CartItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private products: Product[] = [
    { id: 1, name: 'iPhone 15 Pro', unitPrice: 999.99, availableQuantity: 5 },
    { id: 2, name: 'Samsung Galaxy S24', unitPrice: 849.99, availableQuantity: 75 },
    { id: 3, name: 'MacBook Pro M3', unitPrice: 1999.99, availableQuantity: 25 },
    { id: 4, name: 'iPad Air', unitPrice: 599.99, availableQuantity: 100 },
    { id: 5, name: 'AirPods Pro', unitPrice: 249.99, availableQuantity: 200 },
    { id: 6, name: 'Apple Watch Series 9', unitPrice: 399.99, availableQuantity: 80 },
    { id: 7, name: 'Sony WH-1000XM5', unitPrice: 349.99, availableQuantity: 60 },
    { id: 8, name: 'Dell XPS 13', unitPrice: 1299.99, availableQuantity: 30 },
    { id: 9, name: 'Nintendo Switch OLED', unitPrice: 349.99, availableQuantity: 120 },
    { id: 10, name: 'Google Pixel 8 Pro', unitPrice: 999.99, availableQuantity: 45 }
  ];

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }
}