// src/app/store/blog/blog.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as BlogActions from '../actions/blog.actions';
import { BlogState } from '../selectors/blog.selectors';
import { BlogModel } from '../model/blog.model';
import { BlogResponseModel } from '../model/blog-response.model';


export const initialState: BlogState = {
  saveBlog:{} as BlogModel ,
  response: {} as BlogResponseModel,
  selectedBlog: {} as BlogModel,
};

export const blogReducer = createReducer(
  initialState,
  on(BlogActions.createBlogSuccess, (state, { blog }) => ({
    ...state,
    saveBlog : blog
  })),

  on(BlogActions.loadBlogsSuccess, (state, { response }) => ({
    ...state,
    response : response
  })),

  on(BlogActions.loadBlogByIdSuccess, (state, { blog }) => ({
    ...state,
    selectedBlog : blog
  })),

);
