import { createAction, props } from "@ngrx/store";
import { AccountInfoModel } from "../model/account-info.model";
import { ResultModel } from "../model/result.model";
import { MexcModel } from "../model/mexc.model";


export const getAccountInfoAction = createAction(
  "[POST API] getAccountInfoAction"
);

export const getAccountInfoActionSuscess = createAction(
    "[POST API]  suscess getAccountInfoAction Suscesss",
    props<{ items: AccountInfoModel [] }>()
);

export const getAccountInfoActionFail = createAction(
    "[POST API] getAccountInfoAction Fail",
    props<{ msg: any }>()
);


export const getTestConnectAction = createAction(
  "[GET API] getTestConnectAction"
);

export const getTestConnectActionSuscess = createAction(
    "[GET API]  getTestConnectActionSuscess Suscesss",
    props<{ result: ResultModel }>()
);

export const getTestConnectActionFail = createAction(
    "[GET API] getTestConnectAction Fail",
    props<{ msg: any }>()
);


export const addKeyAction = createAction(
  "[POST API] addkeyAction",
  props<{ params : any }>()
);

export const addKeyActionSuscess = createAction(
    "[POST API]  addKeyAction Suscesss",
    props<{ result : ResultModel }>()
);

export const addKeyActionFail = createAction(
    "[POST API] addKeyAction Fail",
    props<{ msg: any }>()
);



export const getListCoin = createAction(
  "[GET API] getListCoin",
  props<{ symbol : string }>()
);

export const getListCoinSuscess = createAction(
    "[POST API]  getListCoin Suscesss",
    props<{ result : MexcModel [] }>()
);

export const getListCoinFail = createAction(
    "[POST API] getListCoin Fail",
    props<{ msg: any }>()
);



