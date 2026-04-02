import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { MemberModel } from "../model/member.model";
import { Injectable } from "@angular/core";
import { ResultModel } from "../model/result.model";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  res: string = '';
  constructor(private _http: HttpClient) { }

  auth(params: any): Observable<MemberModel> {
    let url = `${environment.apiUrl}/api/user/authenticate`;
    return this._http.post<MemberModel>(url, params);
  }

  checkJwt(jwt: string): Observable<boolean> {
    let url = `${environment.apiUrl}/api/user/check-token`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${jwt}`
    });
    return this._http.get<any>(url, { headers: headers }).pipe(
      map(res => {
        // According to backend UserController, 200 is OK, anything else is fail
        return res && res.code === 200;
      })
    );
  }

  addUser(params: any): Observable<ResultModel> {
    let url = `${environment.apiUrl}/api/user/save`;
    return this._http.post<ResultModel>(url, params);
  }
}




