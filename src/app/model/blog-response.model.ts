import { BlogModel } from "./blog.model";

export interface BlogResponseModel {
  blog: BlogModel[]; // Array of ProductModel
  totalCount: number;
}
