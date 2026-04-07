import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthDetail } from "../common/util/auth-detail";
import { map } from "rxjs/operators";

export interface SystemConfig {
  id?: string;
  configKey: string;
  configValue: string;
  description?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {
  private apiUrl = `${environment.apiUrl}/api/v1/config`;

  constructor(private http: HttpClient) { }

  getConfig(key: string): Observable<SystemConfig> {
    if (key === 'USD_VND_RATE') {
      // Route to live exchange rate endpoint instead of static config
      return this.http.get<{rate: number}>(`${environment.apiUrl}/api/v1/assets/exchange-rate`, {
        headers: AuthDetail.getHeaderJwt()
      }).pipe(
        map(res => ({
          configKey: 'USD_VND_RATE',
          configValue: res.rate.toString(),
          description: 'Live USD/VND rate from VCB'
        }))
      );
    }
    return this.http.get<SystemConfig>(`${this.apiUrl}/${key}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  updateConfig(config: SystemConfig): Observable<SystemConfig> {
    return this.http.post<SystemConfig>(this.apiUrl, config, {
      headers: AuthDetail.getHeaderJwt()
    });
  }
}
