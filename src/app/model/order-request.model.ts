export interface OrderRequestModel {
  id?: string;
  userid: string;
  items: OrderItemModel[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  paymentMethodId: string;
  paymentMethod: PaymentMethodModel;
  orderDeliId:string;
  orderDeli:OrderDeli;
}


export interface OrderItemModel {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

export interface PaymentMethodModel {
  provider: string;
  cardNumber?: string;
  expiryDate?: string;
  bankName?: string;
  swiftCode?: string;
  billingAddress: string;
  createdAt: string;
  kind:string;
}


export interface OrderDeli {
  firstName: string;  // Note: Corrected typo from 'fristName' to 'firstName'
  lastName: string;
  email: string;
  addr1: string;
  addr2: string;
  country: string;
  state: string;
  city: string;
  post: string;

}


export interface OrderDetail{
  order:any;
  orderDeli:any;
  paymentMethod:any;
}





