import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CoinService } from '../service/coin.service';
import { getAccountInfoAction, getAccountInfoActionSuscess, getAccountInfoActionFail, getTestConnectAction, getTestConnectActionSuscess, addKeyAction, addKeyActionSuscess, addKeyActionFail, getListCoin, getListCoinSuscess, getListCoinFail } from '../actions/coin.action';
import { MessageService } from '../service/message.service';
import { getMessageBoxAction, getMessageBoxActionFail, getMessageBoxActionSuscess, getMessageByUserAction, getMessageByUserActionFail, getMessageByUserActionSuscess, saveMessageAction, saveMessageActionFail, saveMessageActionSuscess } from '../actions/message.action';




@Injectable()
export class MessageEffect {

  constructor(
    private _actions$: Actions,
    private messageService:MessageService
  ) { }

  getMessageById$ = createEffect(() => this._actions$.pipe(
    ofType(getMessageByUserAction),
    mergeMap((action) => this.messageService.getMessageByUserid(action.userid , action.page).pipe(
      map(res => getMessageByUserActionSuscess({items:res})),
      catchError(msg => of(getMessageByUserActionFail({ msg: msg })))
    ))
  ));

  saveMessage$ = createEffect(() => this._actions$.pipe(
    ofType(saveMessageAction),
    mergeMap((action) => this.messageService.saveMessage(action.params).pipe(
      map(res => saveMessageActionSuscess({item:res})),
      catchError(msg => of(saveMessageActionFail({ msg: msg })))
    ))
  ));

  getMessageBox$ = createEffect(() => this._actions$.pipe(
    ofType(getMessageBoxAction),
    mergeMap((action) => this.messageService.getMessageBox(action.page).pipe(
      map(res => getMessageBoxActionSuscess({items:res})),
      catchError(msg => of(getMessageBoxActionFail({ msg: msg })))
    ))
  ));







}
