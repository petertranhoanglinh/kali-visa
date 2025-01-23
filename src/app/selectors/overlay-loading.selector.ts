import { createFeatureSelector, createSelector } from '@ngrx/store';

import { overlayLoadingFeatureKey } from '../reducers/overlay-loading.reducer';

export interface OverlayLoadingState {
  loading: boolean;
}

export const getOverlayLoadintState = createFeatureSelector<OverlayLoadingState>(overlayLoadingFeatureKey);

export const getLoading = createSelector(
  getOverlayLoadintState,
  (state: OverlayLoadingState) => state.loading
)