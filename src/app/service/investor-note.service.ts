import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvestorNoteModel } from '../model/investor-note.model';
import { environment } from 'src/environments/environment';
import { AuthDetail } from '../common/util/auth-detail';

@Injectable({
  providedIn: 'root'
})
export class InvestorNoteService {
  private apiUrl = environment.apiUrl + '/api/v1/notes'; // Assuming environment.apiUrl is like "http://localhost:8080"

  constructor(private http: HttpClient) { }

  getNotesByUser(userId: string): Observable<InvestorNoteModel[]> {
    return this.http.get<InvestorNoteModel[]>(`${this.apiUrl}/user/${userId}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  addNote(note: InvestorNoteModel): Observable<InvestorNoteModel> {
    return this.http.post<InvestorNoteModel>(this.apiUrl, note, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  updateNote(id: string, note: InvestorNoteModel): Observable<InvestorNoteModel> {
    return this.http.put<InvestorNoteModel>(`${this.apiUrl}/${id}`, note, {
      headers: AuthDetail.getHeaderJwt()
    });
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: AuthDetail.getHeaderJwt()
    });
  }
}

