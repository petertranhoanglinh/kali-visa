
import { createReducer, on } from '@ngrx/store';
import { ResultModel } from '../model/result.model';
import { OrderState } from '../selectors/order.selector';
import {  getOrderDetailsActionSuccess, orderCheckoutActionSuscess } from '../actions/order.action';
import { OrderDetail } from '../model/order-request.model';

export const orderFeatureKey = 'orderKey';

export const initialState: OrderState = {
   resultSaveOrder : {} as ResultModel,
   orderDetail:{} as OrderDetail
}

export const orderReducer = createReducer(
  initialState,
  on(orderCheckoutActionSuscess, (state, { result }) => ({...state, resultSaveOrder: result})),

  on(getOrderDetailsActionSuccess, (state, { orderDetails }) => ({...state, orderDetail: orderDetails})),
);
