import { createFeatureSelector, createSelector } from '@ngrx/store';
import { productFeatureKey } from '../reducers/product.reducer';
import { ProductModel } from '../model/product.model';
import { ProductResponseModel, ProductRewiewResponseModel } from '../model/product-response.model';
import { ResultModel } from '../model/result.model';



export interface ProductState {
  products:  ProductResponseModel;
  resultSaveRewiew:ResultModel;
  rewiews:ProductRewiewResponseModel;
  resultSaveProduct : ResultModel;
}

export const getProductState = createFeatureSelector<ProductState>(productFeatureKey);

export const getProducts = createSelector(
   getProductState,
  (state: ProductState) => state.products
);

export const getResultSaveRewiew = createSelector(
  getProductState,
 (state: ProductState) => state.resultSaveRewiew
);


export const getRewiews = createSelector(
  getProductState,
 (state: ProductState) => state.rewiews
);

export const getResultSaveProduct = createSelector(
  getProductState,
 (state: ProductState) => state.resultSaveProduct
);



