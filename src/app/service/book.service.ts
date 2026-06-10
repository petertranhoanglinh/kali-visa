import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthDetail } from '../common/util/auth-detail';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(private _http: HttpClient) {}

  // USER ENDPOINTS
  getCompletedBooks(): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}/api/books`);
  }

  getBookById(id: string): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}/api/books/${id}`);
  }

  getPageCount(id: string): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}/api/books/${id}/page-count`);
  }

  getBookPage(id: string, pageIdx: number): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}/api/books/${id}/pages/${pageIdx}`);
  }

  // ADMIN ENDPOINTS
  adminUploadBook(file: File, title: string, author: string, description: string, parser: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('parser', parser);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${AuthDetail.getCookie("jwt")}`
    });

    return this._http.post<any>(`${environment.apiUrl}/api/admin/books/upload`, formData, { headers });
  }

  adminGetAllBooks(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${AuthDetail.getCookie("jwt")}`
    });
    return this._http.get<any>(`${environment.apiUrl}/api/admin/books`, { headers });
  }

  adminDeleteBook(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${AuthDetail.getCookie("jwt")}`
    });
    return this._http.delete<any>(`${environment.apiUrl}/api/admin/books/${id}`, { headers });
  }
}
