import { createAction, props } from "@ngrx/store";
import { MemberModel } from "../model/member.model";
import { ResultModel } from "../model/result.model";
import { ProductModel } from "../model/product.model";
import { ProductResponseModel } from "../model/product-response.model";
import { OrderDetail, OrderRequestModel } from "../model/order-request.model";

// load products
export const orderCheckoutAction = createAction(
  "[PRODUCT] order checkout",
  props<{ params: any }>()
);

export const orderCheckoutActionSuscess = createAction(
    "[PRODUCT] order checkout suscess",
    props<{ result: ResultModel}>()
);

export const orderCheckoutActionFail = createAction(
    "[PRODUCT] order checkout fail",
    props<{ msg: any }>()
);

// Action để bắt đầu quá trình lấy chi tiết đơn hàng
export const getOrderDetailsAction = createAction(
  "[ORDER] Get Order Details",
  props<{ orderId: string, userId: string }>()
);

// Action khi quá trình lấy chi tiết đơn hàng thành công
export const getOrderDetailsActionSuccess = createAction(
  "[ORDER] Get Order Details Success",
  props<{ orderDetails: OrderDetail }>()
);

// Action khi quá trình lấy chi tiết đơn hàng thất bại
export const getOrderDetailsActionFail = createAction(
  "[ORDER] Get Order Details Fail",
  props<{ error: any }>()
);
