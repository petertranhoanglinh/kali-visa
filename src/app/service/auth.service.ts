import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs/internal/Observable";
import { MemberModel } from "../model/member.model";
import { Injectable } from "@angular/core";
import { ConvertUtil } from "../common/util/convert.util";
import { ValidationUtil } from "../common/util/validation.util";
import { ResultModel } from "../model/result.model";
@Injectable({
  providedIn: 'root'
})
export class AuthService{
    res:string = '';
    constructor(private _http: HttpClient) { }

  auth(params:any): Observable<MemberModel> {
    let url = `${environment.apiUrl}/api/user/authenticate`;
    return this._http.post<MemberModel>(url,params);
  }

  checkJwt(jwt:string): boolean {
    let url = `${environment.apiUrl}/api/checkLogin/${jwt}`;
    this._http.get<String>(url).subscribe(
      res => {
        if(ValidationUtil.isNotNullAndNotEmpty(res)) {
          this.res = ConvertUtil.convertToSring(res);
        }
      })
      if(this.res!= ""){
        return this.res=="true"?true:false
      }else{this.res = "false"}{
        return false;
      }
     }

     addUser(params:any): Observable<ResultModel> {
      let url = `${environment.apiUrl}/api/user/save`;
      return this._http.post<ResultModel>(url,params);
     }
  }




