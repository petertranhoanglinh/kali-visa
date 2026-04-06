import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './app-layout.component';

import { AuthGuardService } from '../service/auth-guard.service';
import { LoginPageComponent } from './login/login-page/login-page.component';

const portfolioModule = () => import ("../../app/portfolio/portfolio.module").then(m => m.PortfolioModule);

const routes: Routes = [
  {
    path: '', component: AppLayoutComponent, children: [
       { path: '', loadChildren: portfolioModule },
    ]
  },
  { path: 'login', component: LoginPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppLayoutRoutingModule { }
