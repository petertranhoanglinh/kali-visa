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
  private roomSubscriptions: Map<string, any> = new Map(); // Store active room subscriptions
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
    // Check if we are already subscribed to this room to avoid duplicates
    if (this.roomSubscriptions.has(roomId)) {
      return;
    }

    const sub = this.stompClient.subscribe(`/topic/${roomId}`, (messages: any) => {
      const messageContent = JSON.parse(messages.body);
      const currentMessage = this.messageSubject.getValue();
      currentMessage.push(messageContent);
      this.messageSubject.next(currentMessage);
    });

    this.roomSubscriptions.set(roomId, sub);
  }

  leaveRoom(roomId?: string): void {
    if (roomId) {
      const sub = this.roomSubscriptions.get(roomId);
      if (sub) {
        sub.unsubscribe();
        this.roomSubscriptions.delete(roomId);
        console.log(`Left the room ${roomId} and unsubscribed from messages.`);
      }
    } else {
      // Unsubscribe from all rooms
      this.roomSubscriptions.forEach((sub, key) => {
        sub.unsubscribe();
        console.log(`Left the room ${key} and unsubscribed.`);
      });
      this.roomSubscriptions.clear();
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

