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

  validateSymbol(symbol: string): Observable<{isValid: boolean, symbol: string}> {
    return this.http.get<{isValid: boolean, symbol: string}>(`${this.apiUrl}/validate/${symbol}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  getRealtimePrices(symbols: string[], types: string[]): Observable<{[key: string]: number}> {
    return this.http.get<{[key: string]: number}>(`${this.apiUrl}/prices`, {
      params: { symbols: symbols, types: types },
      headers: AuthDetail.getHeaderJwt()
    });
  }

  getAssetListing(type: string = 'ALL'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listing?type=${type}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  getCryptoListing(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/listing/crypto`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }
}
