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
  private messageSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private notificationSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private priceSubject: BehaviorSubject<Data> = new BehaviorSubject<Data>({} as Data);
  private currentRoomSubscription: any; // To hold the current room subscription
  private notificationsSubscription: any; // For header notifications

  constructor() {
    this.initConnenctionSocket();
  }

  initConnenctionSocket() {
    const url = environment.apiUrl + "/ws-chat";
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

  sendMessage(roomId: string, chatMessage: any) {
    this.stompClient.send(`/app/chat/${roomId}`, {}, JSON.stringify(chatMessage));
  }

  getMessageSubject() {
    return this.messageSubject.asObservable();
  }

  subscribeToNotifications(userId: string) {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
      this.notificationsSubscription = null;
    }

    const trySubscribe = () => {
      if (this.stompClient && this.stompClient.connected) {
        this.notificationsSubscription = this.stompClient.subscribe(`/topic/notifications/${userId}`, (msg: any) => {
          try {
            const notif = JSON.parse(msg.body);
            this.notificationSubject.next(notif);
          } catch (e) {
            console.error('Error parsing notification:', e);
          }
        });
        console.log('Subscribed to notifications for user:', userId);
      } else {
        setTimeout(trySubscribe, 1000);
      }
    };

    trySubscribe();
  }

  getNotificationSubject() {
    return this.notificationSubject.asObservable();
  }

  public getPriceUpdates() {
    return this.priceSubject.asObservable();
  }

  public sendSubscriptionMessage(subscriptionMessage: string) {
    this.stompClient.send('/app/startBroadcast', {}, subscriptionMessage);
  }
}

