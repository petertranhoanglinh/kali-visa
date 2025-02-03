import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './app-layout.component';

import { HomePageComponent } from '../home-page/home-page.component';
import { AuthGuardService } from '../service/auth-guard.service';
import { ChatTingComponent } from './trade/chat-ting/chat-ting.component';
import { AuthDetail } from '../common/util/auth-detail';
import { OrderAnalysicComponent } from '../order/order-analysic/order-analysic.component';
import { WeddingComponent } from '../wedding/wedding.component';
import { LoginPageComponent } from './login/login-page/login-page.component';
import { RegisterMemberComponent } from './login/register-member/register-member.component';
import { AdminChatComponent } from './trade/admin-chat/admin-chat.component';
const postModule = () => import ("../../app/app-layout/post/post.module").then(x => x.PostModule);
const orderModule = () => import ("../../app/order/order.module").then(x => x.OrderModule);
const productModule = () => import ("../../app/product/product.module").then(x => x.ProductModule);
const authModule = () => import ("../../app/app-layout/login/login-routing.module").then(x=>x.LoginRoutingModule)
const trade = () => import ("../../app/app-layout/trade/trade.module").then(x=>x.TradeModule)
const about = () => import ("../../app/app-layout/about/about.module").then(x=>x.AboutModule)

let role =  AuthDetail.getLoginedInfo()?.role;
const routes: Routes = [
  {
    path: '', component: AppLayoutComponent, children: [

       { path: '', component: HomePageComponent },
       { path: 'auth', loadChildren: authModule },
       { path: 'shopping',canActivate : [AuthGuardService]  , loadChildren: orderModule },
       { path: 'product',canActivate : [AuthGuardService]  , loadChildren: productModule },
       { path: 'blog', loadChildren: postModule },
       { path: 'trade',canActivate : [AuthGuardService]  , loadChildren: trade },
       { path: 'about'  , loadChildren: about },
       { path: 'chat'  ,canActivate : [AuthGuardService] , component: ChatTingComponent },
       { path: 'chat-admin'  ,canActivate : [AuthGuardService] , component: AdminChatComponent },
    ]
  },
  { path: 'wedding', component: WeddingComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterMemberComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppLayoutRoutingModule { }
