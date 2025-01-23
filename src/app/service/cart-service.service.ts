import { Injectable } from '@angular/core';
import { OrderItemModel } from '../model/order-request.model';
import { ProductModel } from '../model/product.model';
import { AuthState } from '../selectors/auth.selector';
import { Store } from '@ngrx/store';
import { AuthDetail } from '../common/util/auth-detail';
import { setCart } from '../actions/auth.action';

interface Cart {
  id: string;
  items: { [productId: string]: { quantity: number, price: number , productName:string } }; // Map<ProductId, {quantity, price}>
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private getCartKey(cartId: string): string {
    return `cart_${cartId}`;
  }

  constructor(private authStore: Store<AuthState>) { }

  getCart(cartId: string): OrderItemModel[] {
    const cartJson = localStorage.getItem(this.getCartKey(cartId));

    if (!cartJson) {
      return [];
    }

    const cart: Cart = JSON.parse(cartJson);
    const orderItems: OrderItemModel[] = [];

    for (const productId in cart.items) {
      if (cart.items.hasOwnProperty(productId)) {
        const { quantity, price , productName  } = cart.items[productId];
        orderItems.push({ productId, quantity, price , productName});
      }
    }

    return orderItems;
  }

  private getFullCart(cartId: string): Cart | null {
    const cartJson = localStorage.getItem(this.getCartKey(cartId));
    return cartJson ? JSON.parse(cartJson) : null;
  }

  saveCart(cart: Cart): void {
    localStorage.setItem(this.getCartKey(cart.id), JSON.stringify(cart));
  }

  addToCart(cartId: string, temp:ProductModel , quantity:number): void {
    let cart = this.getFullCart(cartId);
    const price = (1-temp.rate)*temp.price

    if (!cart) {
      cart = { id: cartId, items: {} };
    }

    if (!cart.items[temp.id]) {

      cart.items[temp.id] = { quantity: 0, price , productName:temp.name };
    }

    // Update quantity and ensure price is consistent
    cart.items[temp.id].quantity += quantity;
    cart.items[temp.id].price = price;  // Update to the latest price

    this.saveCart(cart);
    this.setQuantityCart();
  }

  removeProductFromCart(cartId: string, productId: string): void {
    let cart = this.getFullCart(cartId);

    if (cart) {
      delete cart.items[productId];
      if (Object.keys(cart.items).length === 0) {
        localStorage.removeItem(this.getCartKey(cartId));
      } else {
        this.saveCart(cart);
      }
    }
    this.setQuantityCart();
  }

  setQuantityCart(){
   let cartNumber = this.getCart(String(AuthDetail.getLoginedInfo()?.id)).length;
   this.authStore.dispatch(setCart({quantity:cartNumber}))
  }

  removeAllProductsFromCart(cartId: string): void {
    // Lấy giỏ hàng đầy đủ từ localStorage
    let cart = this.getFullCart(cartId);

    if (cart) {
      // Xóa tất cả các sản phẩm khỏi giỏ hàng
      cart.items = {};

      // Kiểm tra nếu giỏ hàng rỗng, xóa nó khỏi localStorage
      if (Object.keys(cart.items).length === 0) {
        localStorage.removeItem(this.getCartKey(cartId));
      } else {
        // Lưu giỏ hàng đã được cập nhật
        this.saveCart(cart);
      }
    }

    // Cập nhật số lượng giỏ hàng
    this.setQuantityCart();
  }



}
