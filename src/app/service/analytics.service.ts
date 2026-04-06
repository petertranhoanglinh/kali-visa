import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StockAnalysisResult } from '../model/stock-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient) {}

  analyzeTicker(ticker: string): Observable<StockAnalysisResult> {
    const jwt = localStorage.getItem('jwt');
    let headers = new HttpHeaders();
    
    if (jwt && jwt !== 'null' && jwt !== 'undefined') {
      headers = headers.set('Authorization', `Bearer ${jwt}`);
    }
    
    const params = new HttpParams().set('ticker', ticker);
    
    return this.http.get<StockAnalysisResult>(`${this.apiUrl}/stock/analyze`, { 
      headers, 
      params 
    });
  }
}
