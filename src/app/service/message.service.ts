import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthDetail } from '../common/util/auth-detail';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AccountInfoModel } from '../model/account-info.model';
import { ResultModel } from '../model/result.model';
import { MexcModel } from '../model/mexc.model';
import { MessageModel } from '../model/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private _http: HttpClient) {


  }

  getMessageByUserid(userid:string , page:number) : Observable<MessageModel[]>{
    const header :  HttpHeaders  = AuthDetail.getHeaderJwt();
    return this._http.get<MessageModel[]>(environment.apiUrl+`/api/messages/${userid}?page=${page}`, {
      headers:header
    });
  }

  getMessageBox(page:number) : Observable<MessageModel[]>{
    const header :  HttpHeaders  = AuthDetail.getHeaderJwt();
    return this._http.get<MessageModel[]>(environment.apiUrl+`/api/messages/users/lasted`, {
      headers:header
    });
  }


  saveMessage(params:string) : Observable<MessageModel>{
    const header :  HttpHeaders  = AuthDetail.getHeaderJwt();
    return this._http.post<MessageModel>(environment.apiUrl+`/api/messages`, params,{
      headers:header
    });
  }


}
