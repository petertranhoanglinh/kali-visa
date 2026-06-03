import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AssetModel } from '../model/asset.model';
import { MarketPriceModel } from '../model/market-price.model';
import { portfolioFeatureKey } from '../reducers/portfolio.reducer';

export interface PortfolioState {
  assets: AssetModel[];
  marketPrices: MarketPriceModel[];
  realtimePriceMap: { [key: string]: number };
  exchangeRate: number;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

export const getPortfolioState = createFeatureSelector<PortfolioState>(portfolioFeatureKey);

export const selectAssets = createSelector(
  getPortfolioState,
  (state: PortfolioState) => state.assets
);

export const selectMarketPrices = createSelector(
  getPortfolioState,
  (state: PortfolioState) => state.marketPrices
);

export const selectRealtimePriceMap = createSelector(
  getPortfolioState,
  (state: PortfolioState) => state.realtimePriceMap
);

export const selectExchangeRate = createSelector(
  getPortfolioState,
  (state: PortfolioState) => state.exchangeRate
);

export const selectIsLoading = createSelector(
  getPortfolioState,
  (state: PortfolioState) => state.isLoading
);

export const selectIsLoaded = createSelector(
  getPortfolioState,
  (state: PortfolioState) => state.isLoaded
);

// Merged price map: DB prices + realtime prices (realtime overrides DB)
export const selectMergedPriceMap = createSelector(
  selectMarketPrices,
  selectRealtimePriceMap,
  (dbPrices, rtPrices) => {
    const merged = new Map<string, number>();
    dbPrices.forEach(p => merged.set(p.symbol, p.price));
    Object.keys(rtPrices).forEach(sym => {
      if (rtPrices[sym] > 0) merged.set(sym, rtPrices[sym]);
    });
    return merged;
  }
);
