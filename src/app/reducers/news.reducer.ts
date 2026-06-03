import { createReducer, on } from '@ngrx/store';
import { NewsState } from '../selectors/news.selector';
import {
  loadNews,
  loadNewsSuccess,
  loadNewsFailure,
  loadNextPage,
  loadNextPageSuccess,
  filterByCategory,
  invalidateNewsCache,
} from '../actions/news.actions';

export const newsFeatureKey = 'news';

export const initialState: NewsState = {
  items: [],
  currentPage: 0,
  isLastPage: false,
  isLoading: false,
  isLoadingMore: false,
  isLoaded: false,
  selectedCategory: '',
  error: null,
};

export const newsReducer = createReducer(
  initialState,

  // Load trang đầu → show skeleton, xoá list cũ
  on(loadNews, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(loadNewsSuccess, (state, { items, page, isLastPage, category }) => ({
    ...state,
    items,
    currentPage: page,
    isLastPage,
    selectedCategory: category,
    isLoading: false,
    isLoaded: true,
    error: null,
  })),

  on(loadNewsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    isLoadingMore: false,
    error,
  })),

  // Load next page → spinner nhỏ, giữ nguyên list cũ
  on(loadNextPage, (state) => ({
    ...state,
    isLoadingMore: true,
    error: null,
  })),

  on(loadNextPageSuccess, (state, { items, page, isLastPage }) => ({
    ...state,
    items: [...state.items, ...items],
    currentPage: page,
    isLastPage,
    isLoadingMore: false,
    error: null,
  })),

  // Đổi category → reset toàn bộ, load lại từ đầu
  on(filterByCategory, (state, { category }) => ({
    ...state,
    items: [],
    currentPage: 0,
    isLastPage: false,
    isLoaded: false,
    isLoading: true,
    selectedCategory: category,
    error: null,
  })),

  // Force reload
  on(invalidateNewsCache, (state) => ({
    ...state,
    items: [],
    currentPage: 0,
    isLastPage: false,
    isLoaded: false,
    error: null,
  })),
);
