import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;

  constructor(private http: HttpClient) {}

  ask(message: string, userId?: string): Observable<any> {
    const body: any = { message };
    if (userId) {
      body.userId = userId;
    }
    return this.http.post(`${this.apiUrl}/ask`, body);
  }

  like(question: string, answer: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/like`, { question, answer });
  }
}
