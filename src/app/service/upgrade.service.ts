import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResultModel } from '../model/result.model';
import { AuthDetail } from '../common/util/auth-detail';

@Injectable({
  providedIn: 'root'
})
export class UpgradeService {
  private baseUrl = environment.apiUrl + '/api/upgrade';

  constructor(private http: HttpClient) { }
  
  

submitRequest(userId: string, username: string, targetTier: string, durationMonths: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('username', username);
    formData.append('targetTier', targetTier);
    formData.append('durationMonths', durationMonths.toString());
    formData.append('file', file);

    // LẤY TOKEN: Giả sử AuthDetail.getToken() trả về chuỗi JWT
    const token = AuthDetail.getCookie('jwt')  ; // Thay bằng hàm lấy chuỗi token của bạn

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
        // KHÔNG set 'Content-Type': 'multipart/form-data' ở đây, để trình duyệt tự làm
      })
    };

    return this.http.post(this.baseUrl + '/submit', formData, httpOptions);
}

  getPendingRequests(jwt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${jwt}`
    });
    return this.http.get(this.baseUrl + '/admin/list', {  headers: headers, });
  }

  approveRequest(id: string, days: number, jwt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${jwt}`
    });
    const params = { days: days.toString() };
    return this.http.post(this.baseUrl + `/admin/approve/${id}?days=${days}`, {}, { headers });
  }

  rejectRequest(id: string, note: string, jwt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${jwt}`
    });
    return this.http.post(this.baseUrl + `/admin/reject/${id}?note=${note}`, {}, { headers });
  }

   private getOptions() {
      return { headers: AuthDetail.getHeaderJwt() };
    }
}
