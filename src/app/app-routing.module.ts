import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ChatTingComponent } from './app-layout/trade/chat-ting/chat-ting.component';
const appLayoutModule = () => import ("../app/app-layout/app-layout.module").then(x => x.AppLayoutModule);
const routes: Routes = [
  { path: "", loadChildren: appLayoutModule },
  { path: '**', component: PageNotFoundComponent },
  { path: 'message', component: ChatTingComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
