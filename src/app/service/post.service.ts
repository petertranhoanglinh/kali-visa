import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResultModel } from '../model/result.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private _http: HttpClient){

  }

  addPost(params:any): Observable<ResultModel> {
    let url = `${environment.apiUrl}/api/post/add-post`;
    return this._http.post<ResultModel>(url,params);
   }
}
