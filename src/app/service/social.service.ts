import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostModel, CommentModel } from '../model/social.model';
import { environment } from 'src/environments/environment';
import { AuthDetail } from '../common/util/auth-detail';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private apiUrl = environment.apiUrl + '/api/v1/social';

  constructor(private http: HttpClient) { }

  private getOptions() {
    return { headers: AuthDetail.getHeaderJwt() };
  }

  // POSTS
  getAllPosts(page: number = 0, size: number = 10, authorId?: string): Observable<any> {
    let url = `${this.apiUrl}/posts?page=${page}&size=${size}`;
    if (authorId) {
      url += `&authorId=${authorId}`;
    }
    return this.http.get<any>(url, this.getOptions());
  }

  getPostById(id: string): Observable<PostModel> {
    return this.http.get<PostModel>(`${this.apiUrl}/posts/${id}`, this.getOptions());
  }

  createPost(post: PostModel): Observable<PostModel> {
    return this.http.post<PostModel>(`${this.apiUrl}/posts`, post, this.getOptions());
  }

  deletePost(id: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${id}?userId=${userId}`, this.getOptions());
  }

  deleteMultiplePosts(ids: string[], userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/bulk-delete?userId=${userId}`, ids, this.getOptions());
  }

  updatePost(id: string, post: PostModel, userId: string): Observable<PostModel> {
    return this.http.put<PostModel>(`${this.apiUrl}/posts/${id}?userId=${userId}`, post, this.getOptions());
  }

  toggleLike(postId: string, userId: string): Observable<PostModel> {
    return this.http.post<PostModel>(`${this.apiUrl}/posts/${postId}/like?userId=${userId}`, {}, this.getOptions());
  }

  // COMMENTS
  getComments(postId: string): Observable<CommentModel[]> {
    return this.http.get<CommentModel[]>(`${this.apiUrl}/posts/${postId}/comments`, this.getOptions());
  }

  addComment(postId: string, comment: CommentModel): Observable<CommentModel> {
    return this.http.post<CommentModel>(`${this.apiUrl}/posts/${postId}/comments`, comment, this.getOptions());
  }

  // UPLOAD
  uploadFile(file: File): Observable<{url: string, type: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Must NOT define Content-Type so browser sets 'multipart/form-data' with boundaries
    const headers = { 
      'Authorization': `Bearer ${AuthDetail.getCookie("jwt")}` 
    };
    
    return this.http.post<{url: string, type: string}>(`${this.apiUrl}/upload`, formData, { headers });
  }
}
