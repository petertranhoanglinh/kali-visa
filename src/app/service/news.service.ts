import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MarketNews, NewsResponse } from '../model/market-news.model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = environment.apiUrl + '/api/v1/news';

  constructor(private http: HttpClient) { }

  getNews(page: number, size: number, category?: string): Observable<NewsResponse> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (category) {
      url += `&category=${category}`;
    }
    return this.http.get<NewsResponse>(url);
  }

  forceGenerate(): Observable<string> {
    return this.http.post(`${this.apiUrl}/generate`, {}, { responseType: 'text' });
  }
}
