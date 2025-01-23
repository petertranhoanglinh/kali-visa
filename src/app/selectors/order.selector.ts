import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ResultModel } from '../model/result.model';
import { orderFeatureKey } from '../reducers/order.reducer';
import { OrderDetail } from '../model/order-request.model';



export interface OrderState {
  resultSaveOrder: ResultModel;
  orderDetail:OrderDetail;
}

export const getOrderState = createFeatureSelector<OrderState>(orderFeatureKey);

export const getResultSaveOrders = createSelector(
   getOrderState,
  (state: OrderState) => state.resultSaveOrder
);

export const getOrderDetail= createSelector(
  getOrderState,
 (state: OrderState) => state.orderDetail
);




