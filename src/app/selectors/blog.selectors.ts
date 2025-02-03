import { BlogModel } from 'src/app/model/blog.model';
// src/app/store/blog/blog.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BlogResponseModel } from '../model/blog-response.model';
export const selectBlogState = createFeatureSelector<BlogState>('blog');

export interface BlogState {
  saveBlog:  BlogModel,
  response: BlogResponseModel;
  selectedBlog: BlogModel;
}


export const selectAllBlogs = createSelector(
  selectBlogState,
  (state: BlogState) => state.response
);

export const selectSelectedBlog = createSelector(
  selectBlogState,
  (state: BlogState) => state.selectedBlog
);

export const selectSelectedSaveBlog = createSelector(
  selectBlogState,
  (state: BlogState) => state.saveBlog
);



