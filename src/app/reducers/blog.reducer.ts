// src/app/store/blog/blog.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as BlogActions from '../actions/blog.actions';
import { BlogState } from '../selectors/blog.selectors';
import { BlogModel } from '../model/blog.model';


export const initialState: BlogState = {
  saveBlog:{} as BlogModel ,
  blogs: [],
  selectedBlog: {} as BlogModel,
};

export const blogReducer = createReducer(
  initialState,
  on(BlogActions.createBlogSuccess, (state, { blog }) => ({
    ...state,
    saveBlog : blog
  })),

  on(BlogActions.loadBlogsSuccess, (state, { blogs }) => ({
    ...state,
    blogs : blogs
  })),

  on(BlogActions.loadBlogByIdSuccess, (state, { blog }) => ({
    ...state,
    selectedBlog : blog
  })),

);
