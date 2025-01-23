import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradingComponent } from './trading/trading.component';
import { ConnectApiComponent } from './connect-api/connect-api.component';
import { AccountInfoComponent } from './account-info/account-info.component';
import { TestPriceComponent } from './test-price/test-price.component';
import { SettingTradeComponent } from './setting-trade/setting-trade.component';

const routes: Routes = [
  {path:"trading" , component: TradingComponent} , 
  {path:"connect" , component: ConnectApiComponent} ,
  {path:"account-info" , component: AccountInfoComponent},
  {path:"test-price" , component: TestPriceComponent},
  {path:"setting-trade" , component: SettingTradeComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeRoutingModule { }
