import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CoinService } from '../service/coin.service';
import { getAccountInfoAction, getAccountInfoActionSuscess, getAccountInfoActionFail, getTestConnectAction, getTestConnectActionSuscess, addKeyAction, addKeyActionSuscess, addKeyActionFail, getListCoin, getListCoinSuscess, getListCoinFail } from '../actions/coin.action';




@Injectable()
export class CoinEffect {

  constructor(
    private _actions$: Actions,
    private coinService:CoinService
  ) { }

  accountInfo$ = createEffect(() => this._actions$.pipe(
    ofType(getAccountInfoAction),
    mergeMap(() => this.coinService.getAccountInfo().pipe(
      map(res => getAccountInfoActionSuscess({items:res})),
      catchError(msg => of(getAccountInfoActionFail({ msg: msg.message })))
    ))
  ));

  getConnect$ = createEffect(() => this._actions$.pipe(
    ofType(getTestConnectAction),
    mergeMap(() => this.coinService.getTestConnect().pipe(
      map(res => getTestConnectActionSuscess ({result:res})),
      catchError(msg => of(getAccountInfoActionFail({ msg: msg.message })))
    ))
  ));

  addKey$ = createEffect(() => this._actions$.pipe(
    ofType(addKeyAction),
    mergeMap(({params}) => this.coinService.addKey(params).pipe(
      map(res => addKeyActionSuscess ({result:res})),
      catchError(msg => of(addKeyActionFail({ msg: msg.message })))
    ))
  ));


  getListCoin$ = createEffect(() => this._actions$.pipe(
    ofType(getListCoin),
    mergeMap(({symbol}) => this.coinService.getListCoin(symbol).pipe(
      map(res => getListCoinSuscess({result:res})),
      catchError(msg => of(getListCoinFail({ msg: msg.message })))
    ))
  ));





}
