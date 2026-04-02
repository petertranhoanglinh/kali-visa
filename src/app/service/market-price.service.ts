import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MarketPriceModel } from '../model/market-price.model';
import { AuthDetail } from '../common/util/auth-detail';

@Injectable({
  providedIn: 'root'
})
export class MarketPriceService {
  private apiUrl = `${environment.apiUrl}/api/v1/market-prices`;

  constructor(private http: HttpClient) { }

  getPricesByUser(userId: string): Observable<MarketPriceModel[]> {
    return this.http.get<MarketPriceModel[]>(`${this.apiUrl}/user/${userId}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  updatePrice(marketPrice: MarketPriceModel): Observable<MarketPriceModel> {
    return this.http.post<MarketPriceModel>(this.apiUrl, marketPrice, {
      headers: AuthDetail.getHeaderJwt()
    });
  }
}
