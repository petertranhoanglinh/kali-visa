import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthDetail } from "../common/util/auth-detail";

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
