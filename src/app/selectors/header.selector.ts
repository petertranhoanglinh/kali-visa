import { setPageHeading } from './../actions/header.action';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { headerFeatureKey } from '../reducers/header.reducer';
import { PageHeading } from '../model/page-heading';

export interface HeaderState {
  items: any [];
  isHeader: Boolean;
  pageHeading: PageHeading;
}

export const getHeader = createFeatureSelector<HeaderState>(headerFeatureKey);
export const getIsHeader = createSelector(
    getHeader,
  (state: HeaderState) => state.isHeader
);


export const getPageHeading = createSelector(
  getHeader,
(state: HeaderState) => state.pageHeading
);


