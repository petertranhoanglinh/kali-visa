import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MemberModel } from '../model/member.model';
import { authFeatureKey } from '../reducers/auth.reducer';
import { ResultModel } from '../model/result.model';



export interface AuthState {
  user: MemberModel;
  date: String;
  err:String;
  resultSaveUser:ResultModel;
  getCartNumber:number;
}

export const getAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const getUser = createSelector(
    getAuthState,
  (state: AuthState) => state.user
);

export const getErr = createSelector(
  getAuthState,
(state: AuthState) => state.err
);

export const getResultSaveUser = createSelector(
  getAuthState,
(state: AuthState) => state.resultSaveUser
);

export const getCartNumber = createSelector(
  getAuthState,
(state: AuthState) => state.getCartNumber
);


