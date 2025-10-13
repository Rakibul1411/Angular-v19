import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, CartItem } from '../services/prodcutsList';

@Component({
  selector: 'app-products-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-cart.component.html',
  styleUrl: './products-cart.component.css'
})
export class ProductsCartComponent implements OnInit {
  
  products: Product[] = [];
  selectedProductId: string | number | null = null;
  selectedProduct: Product | null = null;
  cartItems: CartItem[] = [];
  selectedQuantity: number = 1;
  
  grandTotal: number = 0;
  discountPercentage: number = 0;
  discountAmount: number = 0;
  finalPrice: number = 0;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products = this.productService.getProducts();
    this.addDefaultProduct();
  }

  addDefaultProduct(): void {
    const iphone = this.productService.getProductById(1);
    if (iphone) {
      const defaultCartItem: CartItem = {
        id: iphone.id,
        name: iphone.name,
        quantity: iphone.availableQuantity,
        unitPrice: iphone.unitPrice,
        totalPrice: iphone.availableQuantity * iphone.unitPrice
      };
      this.cartItems.push(defaultCartItem);
      this.calculateTotals();
    }
  }

  onProductSelect(): void {
    if (this.selectedProductId) {
      const productId = Number(this.selectedProductId);
      this.selectedProduct = this.productService.getProductById(productId) || null;
      this.selectedQuantity = 1;
    } else {
      this.selectedProduct = null;
    }
  }

  addToCart(): void {

    if (this.selectedProduct && this.selectedQuantity > 0) {
      const existingItemIndex = this.cartItems.findIndex(item => item.id === this.selectedProduct!.id);
      
      if (existingItemIndex !== -1) {
        this.cartItems[existingItemIndex].quantity += this.selectedQuantity;
        this.cartItems[existingItemIndex].totalPrice = 
          this.cartItems[existingItemIndex].quantity * this.cartItems[existingItemIndex].unitPrice;
      } else {
        const cartItem: CartItem = {
          id: this.selectedProduct.id,
          name: this.selectedProduct.name,
          quantity: this.selectedQuantity,
          unitPrice: this.selectedProduct.unitPrice,
          totalPrice: this.selectedQuantity * this.selectedProduct.unitPrice
        };
        this.cartItems.push(cartItem);
      }
      
      this.selectedProductId = "";
      this.selectedProduct = null;
      this.selectedQuantity = 1;
      
      this.calculateTotals();
    }
  }

  updateQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item.quantity > 0) {
      item.totalPrice = item.quantity * item.unitPrice;
      this.calculateTotals();
    }
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.grandTotal = this.cartItems.reduce((total, item) => total + item.totalPrice, 0);
    this.discountAmount = (this.grandTotal * this.discountPercentage) / 100;
    this.finalPrice = this.grandTotal - this.discountAmount;
  }

  onDiscountChange(): void {
    this.calculateTotals();
  }

  clearCart(): void {
    this.cartItems = [];
    this.calculateTotals();
  }
}
