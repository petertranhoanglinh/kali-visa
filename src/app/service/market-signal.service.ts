import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthDetail } from '../common/util/auth-detail';

@Injectable({
  providedIn: 'root'
})
export class MarketSignalService {
  private apiUrl = `${environment.apiUrl}/api/v1/market/signals`;

  constructor(private http: HttpClient) { }

  getAllSignals(page: number = 0, size: number = 20, recommendation?: string): Observable<any> {
    const params: any = {
      page: page.toString(),
      size: size.toString()
    };
    if (recommendation) {
      params.recommendation = recommendation;
    }
    
    return this.http.get<any>(this.apiUrl, {
      params: params,
      headers: AuthDetail.getHeaderJwt()
    });
  }
  getActiveSignals(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active`, {
      params: {
        page: page.toString(),
        size: size.toString()
      },
      headers: AuthDetail.getHeaderJwt()
    });
  }

  scanSymbol(symbol: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/v1/market/scan`, {
      params: { symbol: symbol.toUpperCase() },
      headers: AuthDetail.getHeaderJwt()
    });
  }

  getAiAnalysis(symbol: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/v1/market/ai-analysis`, {
      params: { symbol: symbol.toUpperCase() },
      headers: AuthDetail.getHeaderJwt()
    });
  }
}
