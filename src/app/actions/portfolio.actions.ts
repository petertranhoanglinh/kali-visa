import { createAction, props } from '@ngrx/store';
import { AssetModel } from '../model/asset.model';
import { MarketPriceModel } from '../model/market-price.model';

// Load toàn bộ portfolio data (assets + market prices + exchange rate)
export const loadPortfolioData = createAction(
  '[Portfolio] Load Portfolio Data'
);

export const loadPortfolioDataSuccess = createAction(
  '[Portfolio] Load Portfolio Data Success',
  props<{
    assets: AssetModel[];
    marketPrices: MarketPriceModel[];
    exchangeRate: number;
  }>()
);

export const loadPortfolioDataFailure = createAction(
  '[Portfolio] Load Portfolio Data Failure',
  props<{ error: string }>()
);

// Load giá realtime (PRO) sau khi đã có assets
export const loadRealtimePrices = createAction(
  '[Portfolio] Load Realtime Prices',
  props<{ symbols: string[]; types: string[] }>()
);

export const loadRealtimePricesSuccess = createAction(
  '[Portfolio] Load Realtime Prices Success',
  props<{ priceMap: { [key: string]: number } }>()
);

// Invalidate cache để force reload lần tới (sau add/delete/sell)
export const invalidatePortfolioCache = createAction(
  '[Portfolio] Invalidate Cache'
);

// Refresh ngay lập tức (sau add/delete/sell)
export const refreshPortfolioData = createAction(
  '[Portfolio] Refresh Portfolio Data'
);
