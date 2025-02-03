import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { ChatMessage } from '../model/chatMessage.model';
import { Data } from '../model/data.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private messageSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);
  private priceSubject: BehaviorSubject<Data> = new BehaviorSubject<Data>({} as Data);
  private currentRoomSubscription: any; // To hold the current room subscription

  constructor() {
    this.initConnenctionSocket();
  }

  initConnenctionSocket() {
    //const url = '//localhost:8888/ws';
    const url = environment.apiUrl + "/" + "ws";
    const socket = new SockJS(url);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      // this.stompClient.subscribe('/price', (message: any) => {
      //   if (message.body) {
      //     this.priceSubject.next(JSON.parse(message.body)); // Make sure to parse the body
      //   }
      // });
    });
  }

  joinRoom(roomId: string) {
    // If already subscribed to a room, leave it before joining a new one
    this.leaveRoom();

    this.currentRoomSubscription = this.stompClient.subscribe(`/topic/${roomId}`, (messages: any) => {
      const messageContent = JSON.parse(messages.body);
      const currentMessage = this.messageSubject.getValue();
      currentMessage.push(messageContent);
      this.messageSubject.next(currentMessage);
    });
  }

  leaveRoom(): void {
    if (this.currentRoomSubscription) {
      this.currentRoomSubscription.unsubscribe(); // Unsubscribe from the current room
      this.currentRoomSubscription = null; // Clear the subscription reference
      console.log('Left the room and unsubscribed from messages.');
    }
  }

  sendMessage(roomId: string, chatMessage: ChatMessage) {
    this.stompClient.send(`/app/chat/${roomId}`, {}, JSON.stringify(chatMessage));
  }

  getMessageSubject() {
    return this.messageSubject.asObservable();
  }

  public getPriceUpdates() {
    return this.priceSubject.asObservable();
  }

  public sendSubscriptionMessage(subscriptionMessage: string) {
    this.stompClient.send('/app/startBroadcast', {}, subscriptionMessage);
  }
}

