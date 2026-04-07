import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AssetRule, RebalanceAnalysis } from '../model/asset-rule.model';
import { AuthDetail } from '../common/util/auth-detail';

@Injectable({
  providedIn: 'root'
})
export class AssetRuleService {
  private apiUrl = environment.apiUrl + '/api/asset-rules';

  constructor(private http: HttpClient) {}

  getMyRules(): Observable<AssetRule[]> {
    return this.http.get<AssetRule[]>(this.apiUrl, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  saveRule(rule: AssetRule): Observable<any> {
    return this.http.post(this.apiUrl, rule, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  deleteRule(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  analyzePortfolio(): Observable<RebalanceAnalysis> {
    return this.http.get<RebalanceAnalysis>(`${this.apiUrl}/analyze`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }
}
