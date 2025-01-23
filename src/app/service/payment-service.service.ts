import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentServiceService {

  constructor(private http: HttpClient) { }

  processPayment(paymentRequest: any): Observable<string> {
    return this.http.post(environment.apiUrl + "/api/payment/payment-screen", paymentRequest, { responseType: 'text' });
  }
}
