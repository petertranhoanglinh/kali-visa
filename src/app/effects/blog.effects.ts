// src/app/store/blog/blog.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { BlogService } from '../service/blog.service';
import * as BlogActions from '../actions/blog.actions'

@Injectable()
export class BlogEffects {
  constructor(private actions$: Actions, private blogService: BlogService) {}

  loadBlogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogActions.loadBlogs),
      mergeMap((action) =>
        this.blogService.getAllBlogs(action.params).pipe(
          map((response) => BlogActions.loadBlogsSuccess({ response })),
          catchError((error) => of(BlogActions.loadBlogsFailure({ error })))
        )
      )
    )
  );

  loadBlogById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogActions.loadBlogById),
      mergeMap((action) =>
        this.blogService.getBlogById(action.id).pipe(
          map((blog) => BlogActions.loadBlogByIdSuccess({ blog })),
          catchError((error) => of(BlogActions.loadBlogByIdFailure({ error })))
        )
      )
    )
  );

  createBlog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogActions.createBlog),
      mergeMap((action) =>
        this.blogService.createBlog(action.blog).pipe(
          map((blog) => BlogActions.createBlogSuccess({ blog })),
          catchError((error) => of(BlogActions.createBlogFailure({ error })))
        )
      )
    )
  );

  updateBlog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogActions.updateBlog),
      mergeMap((action) =>
        this.blogService.updateBlog(action.id, action.blog).pipe(
          map((blog) => BlogActions.updateBlogSuccess({ blog })),
          catchError((error) => of(BlogActions.updateBlogFailure({ error })))
        )
      )
    )
  );

  deleteBlog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogActions.deleteBlog),
      mergeMap((action) =>
        this.blogService.deleteBlog(action.id).pipe(
          map(() => BlogActions.deleteBlogSuccess({ id: action.id })),
          catchError((error) => of(BlogActions.deleteBlogFailure({ error })))
        )
      )
    )
  );
}
