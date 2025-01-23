import { createAction, props } from "@ngrx/store";
import { MemberModel } from "../model/member.model";
import { ResultModel } from "../model/result.model";

// load products
export const authAction = createAction(
  "[AUTH API] login system returns jwt and user Details",
  props<{ params: any }>()
);

export const authActionSuscess = createAction(
    "[AUTH API] login system suscess returns jwt and user Details",
    props<{ item: MemberModel}>()
);

export const authActionFail = createAction(
    "[AUTH API] login fail system returns jwt and user Details",
    props<{ msg: any }>()
);

// check JWT

export const checkJwt = createAction(
  "[AUTH API] checkJwt system returns jwt and user Details",
  props<{ jwt: string }>()
);

export const checkJwtSuscess = createAction(
  "[AUTH API] checkJwt system suscess returns jwt and user Details",
  props<{ result: boolean }>()
);

export const checkJwtFail = createAction(
  "[AUTH API] checkJwt system fail returns jwt and user Details",
  props<{ msg: any }>()
);

export const addUser = createAction(
  "[AUTH API] login addUser",
  props<{ params: any }>()
);

export const addUserSuscess = createAction(
    "[AUTH API] login addUser suscess",
    props<{ result: ResultModel}>()
);

export const addUserFail = createAction(
    "[AUTH API] login addUser fail ",
    props<{ msg: any }>()
);


export const setCart  = createAction(
  "[AUTH API] set cart ",
  props<{ quantity: number }>()
);