import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeRoutingModule } from './trade-routing.module';
import { TradingComponent } from './trading/trading.component';
import { ConnectApiComponent } from './connect-api/connect-api.component';
import { AccountInfoComponent } from './account-info/account-info.component';

import { FormsModule } from '@angular/forms';
import { ChatTingComponent } from './chat-ting/chat-ting.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { coinFeatureKey, coinReducer } from 'src/app/reducers/coin.reducer';
import { CoinEffect } from 'src/app/effects/coin.effect';
import { TestPriceComponent } from './test-price/test-price.component';
import { SettingTradeComponent } from './setting-trade/setting-trade.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { AdminChatComponent } from './admin-chat/admin-chat.component';
import { messageFeatureKey, messageReducer } from 'src/app/reducers/message.reducer';
import { MessageEffect } from 'src/app/effects/message.effect';
@NgModule({
  declarations: [
    TradingComponent,
    ConnectApiComponent,
    AccountInfoComponent,
    ChatTingComponent,
    TestPriceComponent,
    SettingTradeComponent,
    AdminChatComponent
  ],
  imports: [
    CommonModule,
    TradeRoutingModule,
    FormsModule,
    ComponentsModule,
    StoreModule.forFeature(coinFeatureKey,coinReducer),
    EffectsModule.forFeature([CoinEffect]),

    StoreModule.forFeature(messageFeatureKey,messageReducer),
    EffectsModule.forFeature([MessageEffect]),
  ]
})
export class TradeModule { }
