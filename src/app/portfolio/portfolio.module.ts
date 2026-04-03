import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioDashboardComponent } from './portfolio-dashboard/portfolio-dashboard.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetRulesComponent } from './asset-rules/asset-rules.component';
import { NewsSummaryComponent } from './news-summary/news-summary.component';
import { PricingComponent } from './pricing/pricing.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { HomeComponent } from './home/home.component';
import { PriceSettingsComponent } from './price-settings/price-settings.component';
import { NotesComponent } from './notes/notes.component';
import { SocialFeedComponent } from './social-feed/social-feed.component';


import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PortfolioDashboardComponent,
    AssetListComponent,
    AssetRulesComponent,
    NewsSummaryComponent,
    PricingComponent,
    CheckoutComponent,
    AnalyticsComponent,
    PrivacyComponent,
    HomeComponent,
    PriceSettingsComponent,
    NotesComponent,
    SocialFeedComponent
  ],
  imports: [
    CommonModule,
    PortfolioRoutingModule,
    NgChartsModule,
    FormsModule
  ]
})
export class PortfolioModule { }
