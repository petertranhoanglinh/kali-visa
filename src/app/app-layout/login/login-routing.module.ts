import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyAccountComponent } from './my-account/my-account.component';

const routes: Routes = [
  // {path:'login' , component:LoginPageComponent},
  // {path:'register' , component:RegisterMemberComponent},
  {path:'my-account' , component:MyAccountComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
