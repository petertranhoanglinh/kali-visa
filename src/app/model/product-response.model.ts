import { ProductRewiewModel } from "./product-rewiew.model";
import { ProductModel } from "./product.model";

export interface ProductResponseModel {
  products: ProductModel[]; // Array of ProductModel
  totalCount: number;       // Total number of products
  countRewiew:number;
}



export interface ProductRewiewResponseModel {
  rewiews: ProductRewiewModel[]; // Array of ProductModel
  totalCount: number;       // Total number of products
}
