import { createAction, props } from "@ngrx/store";
import { AccountInfoModel } from "../model/account-info.model";
import { MessageModel } from "../model/message.model";


export const getMessageByUserAction = createAction(
  "[GET API] getMessageByUserAction",
  props<{ userid: string , page:number}>()
);

export const getMessageByUserActionSuscess = createAction(
    "[GET API]  getMessageByUserAction Suscesss",
    props<{ items: MessageModel [] }>()
);

export const getMessageByUserActionFail = createAction(
    "[GET API] getMessageByUserAction Fail",
    props<{ msg: any }>()
);


export const saveMessageAction = createAction(
  "[GET API] saveMessageAction",
  props<{ params: any }>()
);

export const saveMessageActionSuscess = createAction(
    "[GET API]  saveMessageAction Suscesss",
    props<{ item: MessageModel}>()
);

export const saveMessageActionFail = createAction(
    "[GET API] saveMessageAction Fail",
    props<{ msg: any }>()
);


export const getMessageBoxAction = createAction(
  "[GET API] getMessageBoxAction",
  props<{ page:number}>()
);

export const getMessageBoxActionSuscess = createAction(
    "[GET API]  getMessageBoxAction Suscesss",
    props<{ items: MessageModel [] }>()
);

export const getMessageBoxActionFail = createAction(
    "[GET API] getMessageBoxAction Fail",
    props<{ msg: any }>()
);



