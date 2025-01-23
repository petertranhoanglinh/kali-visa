import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getAccountInfoAction } from 'src/app/actions/coin.action';
import { setShowOverlayLoading } from 'src/app/actions/overlay-loading.action';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { AccountInfoModel } from 'src/app/model/account-info.model';
import { CoinState, getAccountInfo } from 'src/app/selectors/coin.selector';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css']
})
export class AccountInfoComponent implements OnInit {
  accountInfo$ = new Observable<AccountInfoModel []>();
  accountInfo = [] as AccountInfoModel [];


  constructor(private coinStore : Store<CoinState>
    , private _overloading : Store<OverlayLoadingState> ){
    this.accountInfo$ = this.coinStore.select(getAccountInfo);

  }




  ngOnInit(): void {

    this._overloading.dispatch(setShowOverlayLoading({loading:true}));

    this.coinStore.dispatch(getAccountInfoAction());
    this.accountInfo$.subscribe(res =>{
      if(ValidationUtil.isNotNullAndNotEmpty(res)){
        this.accountInfo = res;
        this._overloading.dispatch(setShowOverlayLoading({loading:false}));
      }
    })
  }





}
