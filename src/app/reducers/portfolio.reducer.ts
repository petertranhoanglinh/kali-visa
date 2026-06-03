import { createReducer, on } from '@ngrx/store';
import { PortfolioState } from '../selectors/portfolio.selector';
import {
  loadPortfolioData,
  loadPortfolioDataSuccess,
  loadPortfolioDataFailure,
  loadRealtimePrices,
  loadRealtimePricesSuccess,
  invalidatePortfolioCache,
  refreshPortfolioData,
} from '../actions/portfolio.actions';

export const portfolioFeatureKey = 'portfolio';

export const initialState: PortfolioState = {
  assets: [],
  marketPrices: [],
  realtimePriceMap: {},
  exchangeRate: 25000,
  isLoading: false,
  isLoaded: false,
  error: null,
};

export const portfolioReducer = createReducer(
  initialState,

  // Bắt đầu load
  on(loadPortfolioData, refreshPortfolioData, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  // Load thành công
  on(loadPortfolioDataSuccess, (state, { assets, marketPrices, exchangeRate }) => ({
    ...state,
    assets,
    marketPrices,
    exchangeRate,
    isLoading: false,
    isLoaded: true,
    error: null,
  })),

  // Load thất bại
  on(loadPortfolioDataFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Realtime prices loaded
  on(loadRealtimePricesSuccess, (state, { priceMap }) => ({
    ...state,
    realtimePriceMap: priceMap,
    isLoading: false,
  })),

  // Invalidate: reset loaded flag để lần tới sẽ gọi API lại
  on(invalidatePortfolioCache, (state) => ({
    ...state,
    isLoaded: false,
    realtimePriceMap: {},
  })),
);
