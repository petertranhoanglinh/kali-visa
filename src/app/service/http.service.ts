import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient ) {

   }

   getData(): Observable<any> {
    return this.http.get<any>("https://sewing.ittvweb.com/api_test_json.php");
  }
}
