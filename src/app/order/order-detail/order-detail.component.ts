import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { authAction } from 'src/app/actions/auth.action';
import { getOrderDetailsAction } from 'src/app/actions/order.action';
import { setShowOverlayLoading } from 'src/app/actions/overlay-loading.action';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { OrderDetail } from 'src/app/model/order-request.model';
import { getOrderDetail, OrderState } from 'src/app/selectors/order.selector';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  orderDetails : OrderDetail = {} as OrderDetail
  orderDetails$ = new Observable<OrderDetail>()
  orderId:string = '';
  constructor( private orderStore: Store<OrderState>, private overlayLoadingStore: Store<OverlayLoadingState>) { 
    this.orderDetails$ = this.orderStore.select(getOrderDetail);
  }

  ngOnInit(): void {
   

    this.orderDetails$.subscribe(res =>{
      if(ValidationUtil.isNotNullAndNotEmpty(res)){
        this.orderDetails = res;
      }
      setTimeout(() => {
        this.overlayLoadingStore.dispatch(setShowOverlayLoading({loading:false}));
      }, 400);
    })
  }

  searchOrder(){
      this.overlayLoadingStore.dispatch(setShowOverlayLoading({loading:true}));

    this.orderStore.dispatch(getOrderDetailsAction({  orderId: this.orderId 
      , userId: String(AuthDetail.getLoginedInfo()?.id)}));
  }

}
