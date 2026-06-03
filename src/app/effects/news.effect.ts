import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom, filter } from 'rxjs/operators';

import { NewsService } from '../service/news.service';
import {
  loadNews,
  loadNewsSuccess,
  loadNewsFailure,
  loadNextPage,
  loadNextPageSuccess,
  filterByCategory,
} from '../actions/news.actions';
import {
  selectNewsIsLoaded,
  selectNewsCategory,
  selectNewsItems,
} from '../selectors/news.selector';

@Injectable()
export class NewsEffect {

  constructor(
    private actions$: Actions,
    private store: Store,
    private newsService: NewsService,
  ) {}

  /**
   * Load trang đầu tiên.
   * Nếu đã cache cùng category → bỏ qua (không gọi API).
   */
  loadNews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadNews),
      withLatestFrom(
        this.store.select(selectNewsIsLoaded),
        this.store.select(selectNewsCategory),
      ),
      // Skip nếu đã loaded và đúng category
      filter(([action, isLoaded, cachedCategory]) =>
        !isLoaded || action.category !== cachedCategory
      ),
      switchMap(([action]) =>
        this.newsService.getNews(0, action.size, action.category).pipe(
          map(res => loadNewsSuccess({
            items: res.content,
            page: 0,
            isLastPage: res.last,
            category: action.category,
          })),
          catchError(err => of(loadNewsFailure({ error: err.message || 'Load failed' })))
        )
      )
    )
  );

  /**
   * Load page tiếp theo (infinite scroll).
   * Luôn gọi API vì đây là dữ liệu mới chưa có.
   */
  loadNextPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadNextPage),
      switchMap(({ page, size, category }) =>
        this.newsService.getNews(page, size, category).pipe(
          map(res => loadNextPageSuccess({
            items: res.content,
            page,
            isLastPage: res.last,
          })),
          catchError(err => of(loadNewsFailure({ error: err.message || 'Load more failed' })))
        )
      )
    )
  );

  /**
   * Đổi category → gọi API ngay (reducer đã reset state trước).
   */
  filterByCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(filterByCategory),
      switchMap(({ category, size }) =>
        this.newsService.getNews(0, size, category).pipe(
          map(res => loadNewsSuccess({
            items: res.content,
            page: 0,
            isLastPage: res.last,
            category,
          })),
          catchError(err => of(loadNewsFailure({ error: err.message || 'Filter failed' })))
        )
      )
    )
  );
}
