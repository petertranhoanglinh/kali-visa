import { Component, OnInit } from '@angular/core';
import { Data } from 'src/app/model/data.model';

import { WebSocketService } from 'src/app/service/web-socket-service.service';

@Component({
  selector: 'app-trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css']
})
export class TradingComponent implements OnInit {

  currentPrice: Data = {} as Data;
  subscriptionMessage: string ="BTCUSDT"

  constructor(private webSocketService: WebSocketService) { }

  ngOnInit() {
    this.webSocketService.getPriceUpdates().subscribe(price => {
      this.currentPrice = price;
    });
  }

  startBroadcast() {
    this.webSocketService.sendSubscriptionMessage(this.subscriptionMessage);
  }

}
