import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountInfoModel } from '../model/account-info.model';
import { coinFeatureKey } from '../reducers/coin.reducer';
import { ResultModel } from '../model/result.model';
import { MexcModel } from '../model/mexc.model';



export interface CoinState {
  accountInfo: AccountInfoModel[];
  resultTestConnect:ResultModel;
  addKeyResult:ResultModel;
  listCoin:MexcModel[];
}

export const getCoinState = createFeatureSelector<CoinState>(coinFeatureKey);

export const getAccountInfo = createSelector(
    getCoinState,
  (state: CoinState) => state.accountInfo
);

export const getTestConnect = createSelector(
  getCoinState,
(state: CoinState) => state.resultTestConnect
);

export const getAddKeyResult = createSelector(
  getCoinState,
(state: CoinState) => state.addKeyResult
);

export const getCoins = createSelector(
  getCoinState,
(state: CoinState) => state.listCoin
);



