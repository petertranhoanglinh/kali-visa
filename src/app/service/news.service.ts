import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MarketNews, NewsResponse } from '../model/market-news.model';
import { CommentModel } from '../model/social.model';
import { AuthDetail } from '../common/util/auth-detail';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = environment.apiUrl + '/api/v1/news';

  constructor(private http: HttpClient) { }

  private getOptions() {
    return { headers: AuthDetail.getHeaderJwt() };
  }

  getNews(page: number, size: number, category?: string): Observable<NewsResponse> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (category) {
      url += `&category=${category}`;
    }
    return this.http.get<NewsResponse>(url);
  }

  getNewsById(id: string): Observable<MarketNews> {
    return this.http.get<MarketNews>(`${this.apiUrl}/${id}`);
  }

  getComments(newsId: string): Observable<CommentModel[]> {
    return this.http.get<CommentModel[]>(`${this.apiUrl}/${newsId}/comments`, this.getOptions());
  }

  addComment(newsId: string, comment: CommentModel): Observable<CommentModel> {
    return this.http.post<CommentModel>(`${this.apiUrl}/${newsId}/comments`, comment, this.getOptions());
  }

  forceGenerate(): Observable<string> {
    return this.http.post(`${this.apiUrl}/generate`, {}, { responseType: 'text' });
  }
}
