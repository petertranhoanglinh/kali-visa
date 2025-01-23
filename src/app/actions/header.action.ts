import { createAction, props } from '@ngrx/store';
import { PageHeading } from '../model/page-heading';

export const loadHeader = createAction(
  "[ngx-loading] set show overlay loading",
  props<{ loading: boolean }>()
);


export const setIsHeader = createAction(
  "[ngx-loading] set show header",
  props<{ isHeader: boolean }>()
);


export const setPageHeading= createAction(
  "[ngx-loading] set pageheading",
  props<{ pageHeading: PageHeading }>()
);





