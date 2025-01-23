import { createReducer, on } from '@ngrx/store';
import { MemberModel } from '../model/member.model';
import { AuthState } from '../selectors/auth.selector';
import { addUserSuscess, authActionFail, authActionSuscess } from '../actions/auth.action';
import { DateUtils } from '../common/util/date.util';
import { ConvertUtil } from '../common/util/convert.util';
import { ResultModel } from '../model/result.model';
import { CoinState } from '../selectors/coin.selector';
import {AccountInfoModel} from '../model/account-info.model'
import { addKeyAction, addKeyActionSuscess, getAccountInfoActionSuscess, getListCoinSuscess, getTestConnectActionSuscess } from '../actions/coin.action';

export const coinFeatureKey = 'coinKey';

export const initialState: CoinState = {
  accountInfo : []   ,
  resultTestConnect: {} as ResultModel ,
  addKeyResult : {} as ResultModel,
  listCoin : [],
}

export const coinReducer = createReducer(
  initialState,
  on(getAccountInfoActionSuscess, (state, { items }) => ({...state, accountInfo: items})),
  on(getTestConnectActionSuscess, (state, { result }) => ({...state, resultTestConnect: result})),

  on(addKeyActionSuscess, (state, { result }) => ({...state, addKeyResult: result})),

  on(getListCoinSuscess, (state, { result }) => ({...state, listCoin: result})),
);
