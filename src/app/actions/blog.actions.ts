// src/app/store/blog/blog.actions.ts
import { createAction, props } from '@ngrx/store';
import { BlogModel } from '../model/blog.model';
import { BlogResponseModel } from '../model/blog-response.model';

// Các Action cho CRUD blog
export const loadBlogs = createAction('[Blog] Load Blogs' , props<{ params: any }>());
export const loadBlogsSuccess = createAction(
  '[Blog] Load Blogs Success',
  props<{ response: BlogResponseModel }>()
);
export const loadBlogsFailure = createAction(
  '[Blog] Load Blogs Failure',
  props<{ error: any }>()
);

export const loadBlogById = createAction(
  '[Blog] Load Blog By Id',
  props<{ id: string }>()
);
export const loadBlogByIdSuccess = createAction(
  '[Blog] Load Blog By Id Success',
  props<{ blog: BlogModel }>()
);
export const loadBlogByIdFailure = createAction(
  '[Blog] Load Blog By Id Failure',
  props<{ error: any }>()
);

export const createBlog = createAction(
  '[Blog] Create Blog',
  props<{ blog: BlogModel }>()
);
export const createBlogSuccess = createAction(
  '[Blog] Create Blog Success',
  props<{ blog: BlogModel }>()
);
export const createBlogFailure = createAction(
  '[Blog] Create Blog Failure',
  props<{ error: any }>()
);

export const updateBlog = createAction(
  '[Blog] Update Blog',
  props<{ id: string; blog: BlogModel }>()
);
export const updateBlogSuccess = createAction(
  '[Blog] Update Blog Success',
  props<{ blog: BlogModel }>()
);
export const updateBlogFailure = createAction(
  '[Blog] Update Blog Failure',
  props<{ error: any }>()
);

export const deleteBlog = createAction(
  '[Blog] Delete Blog',
  props<{ id: string }>()
);
export const deleteBlogSuccess = createAction(
  '[Blog] Delete Blog Success',
  props<{ id: string }>()
);
export const deleteBlogFailure = createAction(
  '[Blog] Delete Blog Failure',
  props<{ error: any }>()
);
