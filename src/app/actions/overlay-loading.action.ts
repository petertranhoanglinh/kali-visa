import { createAction, props } from '@ngrx/store';

export const setShowOverlayLoading = createAction(
  "[ngx-loading] set show overlay loading",
  props<{ loading: boolean }>()
);