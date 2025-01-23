import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { addKeyAction } from 'src/app/actions/coin.action';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { ResultModel } from 'src/app/model/result.model';
import { CoinState, getAddKeyResult } from 'src/app/selectors/coin.selector';

@Component({
  selector: 'app-connect-api',
  templateUrl: './connect-api.component.html',
  styleUrls: ['./connect-api.component.css']
})
export class ConnectApiComponent implements OnInit {

  result$ = new Observable<ResultModel>();
  result : ResultModel = {} as ResultModel;

  publicKey:string = '';
  privateKey:string = '';

  sub$ : Subscription  = {} as Subscription


  constructor(private coinStore : Store<CoinState> , private toastr: ToastrService) {

    this.result$ = this.coinStore.select(getAddKeyResult);

  }


  ngOnDestroy():void{
    if (this.sub$) {
      this.sub$.unsubscribe();
    }
  }

  ngOnInit(): void {

   this.sub$ =  this.result$.subscribe(res=>{
      if(ValidationUtil.isNotNullAndNotEmpty(res)){
        if(res.code == 'OK'){
          this.toastr.success("API SAVE AND CONNECTED SUSCESS");
        }else if(res.code == 'BAD'){
          this.toastr.error("API SAVE BUT CONNECTED FAIL");
        }
      }
    })




  }

  submit(){
    const params = {
      publicKey : this.publicKey,
      privateKey: this.privateKey

    }

    this.coinStore.dispatch(addKeyAction({params:params}));
  }



}
