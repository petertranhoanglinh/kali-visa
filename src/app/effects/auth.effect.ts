import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { addUser, addUserFail, addUserSuscess, authAction , authActionFail , authActionSuscess } from '../actions/auth.action';




@Injectable()
export class AuthEffect {

  constructor(
    private _actions$: Actions,
    private auth: AuthService
  ) { }

  auth$ = createEffect(() => this._actions$.pipe(
    ofType(authAction),
    mergeMap(({ params }) => this.auth.auth(params).pipe(
      map(res => authActionSuscess({item:res})),
      catchError(msg => of(authActionFail({ msg: msg.message })))
    ))
  ));

  addUser$ = createEffect(() => this._actions$.pipe(
    ofType(addUser),
    mergeMap(({ params }) => this.auth.addUser(params).pipe(
      map(res => addUserSuscess({result:res})),
      catchError(msg => of(addUserFail({ msg: msg.message })))
    ))
  ));



}
