import { createReducer, on } from '@ngrx/store';
import { MemberModel } from '../model/member.model';
import { AuthState } from '../selectors/auth.selector';
import { addUserSuscess, authActionFail, authActionSuscess, setCart } from '../actions/auth.action';
import { DateUtils } from '../common/util/date.util';
import { ConvertUtil } from '../common/util/convert.util';
import { ResultModel } from '../model/result.model';
import { CommonUtils } from '../common/util/common-utils';


export const authFeatureKey = 'authKey';

export const initialState: AuthState = {
  user: {} as MemberModel,
  date: {} as String,
  err: {} as String,
  resultSaveUser: {}  as ResultModel,
  getCartNumber: {} as number
}

export const authReducer = createReducer(
  initialState,
  on(authActionSuscess, (state, { item }) => ({...state, user: item})),
  on(authActionFail, (state, { msg }) => ({...state, err:msg + String(CommonUtils.generateRandomString(20))})),
  on(authActionSuscess, (state, { item }) => ({...state, date: ConvertUtil.convertToSring(DateUtils.getCurrFullDateTimeStr) })),
  on(addUserSuscess, (state, { result }) => ({...state, resultSaveUser: result})),
  on(setCart, (state, { quantity }) => ({...state, getCartNumber: quantity})),
);
