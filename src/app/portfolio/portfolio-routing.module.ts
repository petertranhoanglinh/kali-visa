import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioDashboardComponent } from './portfolio-dashboard/portfolio-dashboard.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetRulesComponent } from './asset-rules/asset-rules.component';
import { PricingComponent } from './pricing/pricing.component';
import { CheckoutComponent } from './checkout/checkout.component';

import { AnalyticsComponent } from './analytics/analytics.component';
import { NewsSummaryComponent } from './news-summary/news-summary.component';
import { NewsDetailComponent } from './news-detail/news-detail.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { HomeComponent } from './home/home.component';
import { PriceSettingsComponent } from './price-settings/price-settings.component';
import { NotesComponent } from './notes/notes.component';
import { SocialFeedComponent } from './social-feed/social-feed.component';
import { AdminUpgradeComponent } from './admin-upgrade/admin-upgrade.component';
import { AuthGuardService } from '../service/auth-guard.service';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: PortfolioDashboardComponent, canActivate: [AuthGuardService] },
  { path: 'assets', component: AssetListComponent, canActivate: [AuthGuardService] },
  { path: 'rules', component: AssetRulesComponent, canActivate: [AuthGuardService] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuardService] },
  { path: 'news', component: NewsSummaryComponent },
  { path: 'news/:id', component: NewsDetailComponent },
  { path: 'pricing', component: PricingComponent, canActivate: [AuthGuardService] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuardService] },
  { path: 'price-settings', component: PriceSettingsComponent, canActivate: [AuthGuardService] },
  { path: 'notes', component: NotesComponent, canActivate: [AuthGuardService] },
  { path: 'social', component: SocialFeedComponent, canActivate: [AuthGuardService] },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'admin-upgrade', component: AdminUpgradeComponent, canActivate: [AuthGuardService] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortfolioRoutingModule { }
