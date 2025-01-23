import { ParsedProperty } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { orderCheckoutAction } from 'src/app/actions/order.action';
import { productAction } from 'src/app/actions/product.action';
import { Common } from 'src/app/common/constant/common';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { CustomDialogComponent } from 'src/app/components/custom-dialog/custom-dialog.component';
import { OrderRequestModel } from 'src/app/model/order-request.model';
import { ProductResponseModel } from 'src/app/model/product-response.model';
import { ProductModel } from 'src/app/model/product.model';
import { ResultModel } from 'src/app/model/result.model';
import { TableConfig } from 'src/app/model/table-config';
import { getResultSaveOrders, OrderState } from 'src/app/selectors/order.selector';
import { getProducts, ProductState } from 'src/app/selectors/product.selector';
import { CartService } from 'src/app/service/cart-service.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  newProduct: string = '';
  promoCode: string = '';

  page = 0;
  len = 5;
  total = 0;
  promotionCode = -5;

  result$ = new Observable<ResultModel>();

  items$ = new Observable<ProductResponseModel>();
  items: ProductModel[] = [];
  isSubmitCoinPayment : boolean = false;


  config: TableConfig = {
    columns: [
      { header: "Product Name", field: "name" },
      { header: "Price", field: "price" },
      { header: "Rate Sale", field: "rateShow" },
      { header: "Price Sale", field: "priceSaleShow" },
      { header: "Stock", field: "stock" },

    ]

  }




  orderRequest: OrderRequestModel = {
    userid: '',
    items: [],

    totalAmount: 0,
    status: 'PENDING',
    shippingAddress: '',
    paymentMethodId: '',
    paymentMethod: {
      provider: '',
      cardNumber: '',
      expiryDate: '',
      bankName: '',
      swiftCode: '',
      billingAddress: '',
      kind:'',
      createdAt: new Date().toISOString() // Initial date value
    },
    orderDeliId:'',
    orderDeli: {
    firstName: '' , // Note: Corrected typo from 'fristName' to 'firstName'
    lastName: '',
    email: '',
    addr1: '',
    addr2: '',
    country: '',
    state: '',
    city: '',
    post: '',

    }
  };


  constructor(private cartService : CartService, private productStore: Store<ProductState>
    , private toastr: ToastrService , private orderStore: Store<OrderState> , private dialog: MatDialog) {
    this.items$ = this.productStore.select(getProducts);

    this.result$ = this.orderStore.select(getResultSaveOrders)
    this.loadCart();
  }

  ngOnInit(): void {
    this.loadProduct();
    this.items$.subscribe(res => {
      if (ValidationUtil.isNotNullAndNotEmpty(res)) {
        this.items = res.products;
        this.total = res.totalCount;

        this.items = this.items.map(item => ({
          ...item,
          rateShow: String((item.rate * 100).toFixed(2) ) + "%"
          , priceSaleShow : String(  ((1-item.rate)*item.price).toFixed(2)     )  // Thực hiện phép tính và lưu vào đối tượng
        }));

      }
    })



    this.result$.subscribe(res =>{
      if (ValidationUtil.isNotNullAndNotEmpty(res.code)) {
        if (Number(res.code) === Common.CODE_OK) {
         const dialogRef = this.dialog.open(CustomDialogComponent, {
            data: {
              message: res.msg + ' ' + res.data.id ,
              code:200
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            this.afterCheckout();
          });
        } else {
          this.dialog.open(CustomDialogComponent, {
            data: {
              message: String(res.data)
            }
          });
        }
      }
    })

  }



  isPopupOpen = false;

  openPopup(): void {
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
  }

  onSumit(): void {

  }

  handlePageEvent(page: PageEvent) {
    this.page = page.pageIndex;
    this.len = page.pageSize;
    this.loadProduct();
  }

  loadProduct(): void {
    this.productStore.dispatch(productAction({
      params: {
        page: this.page,
        len: this.len,

      }
    }))


  }

  clickRow(item: any) {
    const id =  AuthDetail.getLoginedInfo()?.id;
    this.cartService.addToCart(String(id), item, 1 );
    this.loadCart();
    this.isPopupOpen = false;
    this.toastr.success("Add Cart suscess")

  }

  removeFromCart(productId: string): void {
    const id =  AuthDetail.getLoginedInfo()?.id;
    this.cartService.removeProductFromCart(String(id), productId);
    this.loadCart();

  }

  loadCart(){
    this.orderRequest.items = this.cartService.getCart(String(AuthDetail.getLoginedInfo()?.id))
    this.orderRequest.totalAmount  = 0;
    for (const item of this.orderRequest.items ){
      this.orderRequest.totalAmount  =this.orderRequest.totalAmount +  (item.price * item.quantity) ;
    }

    this.orderRequest.totalAmount  = this.orderRequest.totalAmount  + this.promotionCode
  }

  createOrderRequestPayload() {
    // Assuming you may need to transform or format the data
    const payload = {
      userid: AuthDetail.getLoginedInfo()?.id,
      items: this.orderRequest.items,
      totalAmount: this.orderRequest.totalAmount,
      status: this.orderRequest.status,
      shippingAddress: this.orderRequest.shippingAddress,
      paymentMethodId: this.orderRequest.paymentMethodId,
      paymentMethod: {
        provider: this.orderRequest.paymentMethod.provider,
        cardNumber: this.orderRequest.paymentMethod.cardNumber,
        expiryDate: this.orderRequest.paymentMethod.expiryDate,
        bankName: this.orderRequest.paymentMethod.bankName,
        swiftCode: this.orderRequest.paymentMethod.swiftCode,
        billingAddress: this.orderRequest.paymentMethod.billingAddress,
        kind: this.orderRequest.paymentMethod.kind,
        createdAt: this.orderRequest.paymentMethod.createdAt
      },
      orderDeliId: this.orderRequest.orderDeliId,
      orderDeli: {
        firstName: this.orderRequest.orderDeli.firstName,
        lastName: this.orderRequest.orderDeli.lastName,
        email: this.orderRequest.orderDeli.email,
        addr1: this.orderRequest.orderDeli.addr1,
        addr2: this.orderRequest.orderDeli.addr2,
        country: this.orderRequest.orderDeli.country,
        state: this.orderRequest.orderDeli.state,
        city: this.orderRequest.orderDeli.city,
        post: this.orderRequest.orderDeli.post
      }
    };

    return payload;
  }


  submit(){
    if(!this.validateForm()) return;

    if(this.orderRequest.paymentMethod.kind == "coin"){
      this.paymentCoin();
    }else{
      this.orderStore.dispatch(orderCheckoutAction({params : this.createOrderRequestPayload()}));
    }

  }


  validateForm() {
    let isValid = true;

    if (!this.orderRequest.orderDeli.firstName) {
      this.toastr.error('First Name is required.');
      isValid = false;
    }

    if (!this.orderRequest.orderDeli.lastName) {
      this.toastr.error('Last Name is required.');
      isValid = false;
    }


    if (!this.orderRequest.orderDeli.addr1) {
      this.toastr.error('Address Line 1 is required.');
      isValid = false;
    }

    if (!this.orderRequest.orderDeli.country) {
      this.toastr.error('Country is required.');
      isValid = false;
    }

    if (!this.orderRequest.orderDeli.city) {
      this.toastr.error('City is required.');
      isValid = false;
    }

    if (!this.orderRequest.paymentMethod.kind) {
      this.toastr.error('Payment method is required.');
      isValid = false;
    }

    if(this.orderRequest.paymentMethod.kind != 'paypal' && this.orderRequest.paymentMethod.kind != 'coin'){

      if (!this.orderRequest.paymentMethod.provider) {
        this.toastr.error('Name on card is required.');
        isValid = false;
      }

      if (!this.orderRequest.paymentMethod.cardNumber) {
        this.toastr.error('Credit card number is required.');
        isValid = false;
      }

      if (!this.orderRequest.paymentMethod.expiryDate) {
        this.toastr.error('Expiration date is required.');
        isValid = false;
      }

      if (!this.orderRequest.paymentMethod.swiftCode) {
        this.toastr.error('CVV is required.');
        isValid = false;
      }
    }


    // if (this.orderRequest.items.length  == 0) {
    //   this.toastr.error('Items is required.');
    //   isValid = false;
    // }

    return isValid;
  }

  afterCheckout(){

    const id =  AuthDetail.getLoginedInfo()?.id;
    this.cartService.removeAllProductsFromCart(String(id))
    window.location.reload();
  }
  paymentCoin(){
    this.isSubmitCoinPayment = true;
  }


}
