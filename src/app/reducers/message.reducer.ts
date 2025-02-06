import { createReducer, on } from '@ngrx/store';
import { MemberModel } from '../model/member.model';
import { AuthState } from '../selectors/auth.selector';
import { addUserSuscess, authActionFail, authActionSuscess } from '../actions/auth.action';
import { DateUtils } from '../common/util/date.util';
import { ConvertUtil } from '../common/util/convert.util';
import { ResultModel } from '../model/result.model';
import {AccountInfoModel} from '../model/account-info.model'
import { getMessageBoxActionSuscess, getMessageByUserActionSuscess } from '../actions/message.action';
import { MessageState } from '../selectors/message.selector';


export const messageFeatureKey = 'messageKey';

export const initialState: MessageState = {
  items : []   ,
  itemsBox: [],

}

export const messageReducer = createReducer(
  initialState,
  on(getMessageByUserActionSuscess, (state, { items }) => ({...state, items: items})),
  on(getMessageBoxActionSuscess, (state, { items }) => ({...state, itemsBox: items})),
);
