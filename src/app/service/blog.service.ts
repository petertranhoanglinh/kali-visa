import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BlogModel } from '../model/blog.model';
import { AuthDetail } from '../common/util/auth-detail';


@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private _http: HttpClient) {}

  // Lấy tất cả blog
  getAllBlogs(): Observable<BlogModel[]> {
    const header: HttpHeaders = AuthDetail.getHeaderJwt();  // Lấy header với JWT từ AuthDetail
    return this._http.get<BlogModel[]>(`${environment.apiUrl}/api/blogs/all`);
  }

  // Lấy chi tiết blog theo ID
  getBlogById(id: string): Observable<BlogModel> {
    const header: HttpHeaders = AuthDetail.getHeaderJwt();  // Lấy header với JWT từ AuthDetail
    return this._http.get<BlogModel>(`${environment.apiUrl}/api/blogs/${id}`);
  }

  // Tạo mới blog
  createBlog(blog: BlogModel): Observable<BlogModel> {
    const header: HttpHeaders = AuthDetail.getHeaderJwt();  // Lấy header với JWT từ AuthDetail
    return this._http.post<BlogModel>(`${environment.apiUrl}/api/blogs`, blog , { headers: header });
  }

  // Cập nhật blog
  updateBlog(id: string, blog: BlogModel): Observable<BlogModel> {
    const header: HttpHeaders = AuthDetail.getHeaderJwt();  // Lấy header với JWT từ AuthDetail
    return this._http.put<BlogModel>(`${environment.apiUrl}/api/blogs/${id}`, blog);
  }

  // Xóa blog
  deleteBlog(id: string): Observable<void> {
    const header: HttpHeaders = AuthDetail.getHeaderJwt();  // Lấy header với JWT từ AuthDetail
    return this._http.delete<void>(`${environment.apiUrl}/api/blogs/${id}`);
  }
}
