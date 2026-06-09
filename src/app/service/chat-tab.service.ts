import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatTabService {
  private openTabSubject = new Subject<string>(); // Emits friendId

  openTab$ = this.openTabSubject.asObservable();

  openTab(friendId: string) {
    this.openTabSubject.next(friendId);
  }
}
