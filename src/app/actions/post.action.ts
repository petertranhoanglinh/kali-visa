import { createAction, props } from "@ngrx/store";
import { MemberModel } from "../model/member.model";
import { ResultModel } from "../model/result.model";

// add POST
export const postAction = createAction(
  "[POST API] postAction",
  props<{ params: any }>()
);

export const postActionSuscess = createAction(
    "[POST API]  suscess postAction",
    props<{ item: MemberModel}>()
);

export const postActionFail = createAction(
    "[POST API]  fail postAction",
    props<{ msg: any }>()
);

