import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthDetail } from '../common/util/auth-detail';
import { Observable } from 'rxjs';
import { ResultModel } from '../model/result.model';
import { environment } from 'src/environments/environment';
import { OrderDetail } from '../model/order-request.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private _http: HttpClient) { }

  saveOrder(params:any): Observable<ResultModel> {
    const url = `${environment.apiUrl}/api/orders`;
    const headers: HttpHeaders = AuthDetail.getHeaderJwt();
   
    return this._http.post<ResultModel>(`${url}`,
    params,  
    {
        headers: headers
    });
  }

  getOrderDetails(orderId: string, userId: string): Observable<OrderDetail> {
    const headers: HttpHeaders = AuthDetail.getHeaderJwt();

    return this._http.get<OrderDetail>(`${environment.apiUrl}/api/orders/${orderId}?userId=${userId}`,  {
      headers: headers
    });
  }
}
