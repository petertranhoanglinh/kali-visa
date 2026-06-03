import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PostModel } from '../model/social.model';
import { socialFeatureKey } from '../reducers/social.reducer';

export interface SocialState {
  posts: PostModel[];
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;       // Skeleton toàn trang (load lần đầu)
  isLoadingMore: boolean;   // Spinner nhỏ infinite scroll
  isLoaded: boolean;
  filterMode: 'ALL' | 'MINE';
  error: string | null;
}

export const getSocialState = createFeatureSelector<SocialState>(socialFeatureKey);

export const selectPosts = createSelector(
  getSocialState,
  (s) => s.posts
);

export const selectSocialIsLoading = createSelector(
  getSocialState,
  (s) => s.isLoading
);

export const selectSocialIsLoadingMore = createSelector(
  getSocialState,
  (s) => s.isLoadingMore
);

export const selectSocialIsLoaded = createSelector(
  getSocialState,
  (s) => s.isLoaded
);

export const selectSocialHasMore = createSelector(
  getSocialState,
  (s) => s.hasMore
);

export const selectSocialCurrentPage = createSelector(
  getSocialState,
  (s) => s.currentPage
);

export const selectSocialFilterMode = createSelector(
  getSocialState,
  (s) => s.filterMode
);
