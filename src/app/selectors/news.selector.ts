import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MarketNews } from '../model/market-news.model';
import { newsFeatureKey } from '../reducers/news.reducer';

export interface NewsState {
  items: MarketNews[];           // Tất cả tin đã load (tích luỹ)
  currentPage: number;
  isLastPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;        // Chỉ spinner infinite scroll (không ảnh hưởng list cũ)
  isLoaded: boolean;             // Đã load lần đầu chưa
  selectedCategory: string;
  error: string | null;
}

export const getNewsState = createFeatureSelector<NewsState>(newsFeatureKey);

export const selectNewsItems = createSelector(
  getNewsState,
  (state) => state.items
);

export const selectNewsIsLoading = createSelector(
  getNewsState,
  (state) => state.isLoading
);

export const selectNewsIsLoadingMore = createSelector(
  getNewsState,
  (state) => state.isLoadingMore
);

export const selectNewsIsLoaded = createSelector(
  getNewsState,
  (state) => state.isLoaded
);

export const selectNewsIsLastPage = createSelector(
  getNewsState,
  (state) => state.isLastPage
);

export const selectNewsCurrentPage = createSelector(
  getNewsState,
  (state) => state.currentPage
);

export const selectNewsCategory = createSelector(
  getNewsState,
  (state) => state.selectedCategory
);
