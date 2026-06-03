import { createAction, props } from '@ngrx/store';
import { MarketNews } from '../model/market-news.model';

// Load trang đầu (hoặc filter theo category)
export const loadNews = createAction(
  '[News] Load News',
  props<{ page: number; size: number; category: string }>()
);

export const loadNewsSuccess = createAction(
  '[News] Load News Success',
  props<{ items: MarketNews[]; page: number; isLastPage: boolean; category: string }>()
);

export const loadNewsFailure = createAction(
  '[News] Load News Failure',
  props<{ error: string }>()
);

// Append thêm trang (infinite scroll)
export const loadNextPage = createAction(
  '[News] Load Next Page',
  props<{ page: number; size: number; category: string }>()
);

export const loadNextPageSuccess = createAction(
  '[News] Load Next Page Success',
  props<{ items: MarketNews[]; page: number; isLastPage: boolean }>()
);

// Đổi category → reset cache
export const filterByCategory = createAction(
  '[News] Filter By Category',
  props<{ category: string; size: number }>()
);

// Invalidate để force reload (sau forceGenerate)
export const invalidateNewsCache = createAction(
  '[News] Invalidate Cache'
);
