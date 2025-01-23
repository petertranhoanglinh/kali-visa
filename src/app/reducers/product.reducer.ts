import { ProductResponseModel, ProductRewiewResponseModel } from './../model/product-response.model';
import { createReducer, on } from '@ngrx/store';
import { ProductState } from '../selectors/product.selector';
import { ProductModel } from '../model/product.model';
import { getRewiewsActionSuscess, productActionSuscess, saveProductActionSuscess, saveProductRewiewActionSuscess } from '../actions/product.action';
import { ResultModel } from '../model/result.model';

export const productFeatureKey = 'productKey';

export const initialState: ProductState = {
  products: {} as ProductResponseModel,
  resultSaveRewiew: {} as ResultModel,
  rewiews: {} as ProductRewiewResponseModel,
  resultSaveProduct: {} as ResultModel
}

export const productReducer = createReducer(
  initialState,
  on(productActionSuscess, (state, { items }) => ({...state, products: items})),
  on(saveProductRewiewActionSuscess, (state, { result }) => ({...state, resultSaveRewiew: result})),
  on(getRewiewsActionSuscess, (state, { items }) => ({...state, rewiews: items})),
  on(saveProductActionSuscess, (state, { result }) => ({...state, resultSaveProduct: result})),
);
