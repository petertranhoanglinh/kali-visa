import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthDetail } from '../common/util/auth-detail';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AccountInfoModel } from '../model/account-info.model';
import { ResultModel } from '../model/result.model';
import { MexcModel } from '../model/mexc.model';

@Injectable({
  providedIn: 'root'
})
export class CoinService {

  constructor(private _http: HttpClient) {


  }

  getAccountInfo() : Observable<AccountInfoModel[]>{
    const header :  HttpHeaders  = AuthDetail.getHeaderJwt();
    return this._http.post<AccountInfoModel[]>(environment.apiUrl + '/api/coin/myAccount', null, {
      headers:header
    });
  }

  getTestConnect() : Observable<ResultModel>{
    const header :  HttpHeaders  = AuthDetail.getHeaderJwt();
    return this._http.get<ResultModel>(environment.apiUrl + '/api/coin/testConnect', {
      headers:header
    });
  }

  addKey( params:any) : Observable<ResultModel>{
    const header :  HttpHeaders  = AuthDetail.getHeaderJwt();
    return this._http.post<ResultModel>(environment.apiUrl + '/api/coin/addKey', params, {
      headers:header
    });
  }

  getListCoin(symbol :string) : Observable<MexcModel[]>{
    const header :  HttpHeaders  = AuthDetail.getHeaderJwt();
    return this._http.get<MexcModel[]>(`${environment.apiUrl}/api/coin/get24h/${symbol}`);
  }
}
