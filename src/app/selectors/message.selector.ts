import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageModel } from '../model/message.model';
import { messageFeatureKey } from '../reducers/message.reducer';



export interface MessageState {
  items: MessageModel[];
  itemsBox: MessageModel[];
}

export const getMessageState = createFeatureSelector<MessageState>(messageFeatureKey);

export const getMessageByUserid = createSelector(
    getMessageState,
  (state: MessageState) => state.items
);

export const getMessageBox = createSelector(
  getMessageState,
(state: MessageState) => state.itemsBox
);



