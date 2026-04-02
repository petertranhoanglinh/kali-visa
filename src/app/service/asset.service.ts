import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AssetModel } from "../model/asset.model";
import { AuthDetail } from "../common/util/auth-detail";

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = `${environment.apiUrl}/api/v1/assets`;

  constructor(private http: HttpClient) { }

  getAssetsByUser(userId: string): Observable<AssetModel[]> {
    return this.http.get<AssetModel[]>(`${this.apiUrl}/user/${userId}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  addAsset(asset: AssetModel): Observable<AssetModel> {
    return this.http.post<AssetModel>(this.apiUrl, asset, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  updateAsset(id: string, asset: Partial<AssetModel>): Observable<AssetModel> {
    return this.http.put<AssetModel>(`${this.apiUrl}/${id}`, asset, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  deleteAsset(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }
}
