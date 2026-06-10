import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioDashboardComponent } from './portfolio-dashboard/portfolio-dashboard.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { portfolioReducer, portfolioFeatureKey } from '../reducers/portfolio.reducer';
import { PortfolioEffect } from '../effects/portfolio.effect';
import { newsReducer, newsFeatureKey } from '../reducers/news.reducer';
import { NewsEffect } from '../effects/news.effect';
import { socialReducer, socialFeatureKey } from '../reducers/social.reducer';
import { SocialEffect } from '../effects/social.effect';
import { profileReducer, profileFeatureKey } from '../reducers/profile.reducer';
import { ProfileEffect } from '../effects/profile.effect';
import { AssetRulesComponent } from './asset-rules/asset-rules.component';
import { NewsSummaryComponent } from './news-summary/news-summary.component';
import { PricingComponent } from './pricing/pricing.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { BacktesterComponent } from './backtester/backtester.component';
import { ScreenerComponent } from './screener/screener.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { HomeComponent } from './home/home.component';
import { PriceSettingsComponent } from './price-settings/price-settings.component';
import { NotesComponent } from './notes/notes.component';
import { SocialFeedComponent } from './social-feed/social-feed.component';
import { NewsDetailComponent } from './news-detail/news-detail.component';
import { AdminUpgradeComponent } from './admin-upgrade/admin-upgrade.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AdminSettingComponent } from './admin-setting/admin-setting.component';
import { AdminNewsComponent } from './admin-news/admin-news.component';
import { AdminPostsComponent } from './admin-posts/admin-posts.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { UserSettingComponent } from './user-setting/user-setting.component';
import { AdminBooksComponent } from './admin-books/admin-books.component';
import { BooksComponent } from './books/books.component';
import { BookReaderComponent } from './book-reader/book-reader.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserChatComponent } from './user-chat/user-chat.component';


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
    BacktesterComponent,
    ScreenerComponent,
    PrivacyComponent,
    HomeComponent,
    PriceSettingsComponent,
    NotesComponent,
    SocialFeedComponent,
    NewsDetailComponent,
    AdminUpgradeComponent,
    AdminSettingComponent,
    AdminNewsComponent,
    AdminPostsComponent,
    AdminUsersComponent,
    UserSettingComponent,
    AdminBooksComponent,
    BooksComponent,
    BookReaderComponent,
    UserProfileComponent,
    UserChatComponent
  ],
  imports: [
    CommonModule,
    PortfolioRoutingModule,
    NgChartsModule,
    FormsModule,
    CKEditorModule,
    StoreModule.forFeature(portfolioFeatureKey, portfolioReducer),
    StoreModule.forFeature(newsFeatureKey, newsReducer),
    StoreModule.forFeature(socialFeatureKey, socialReducer),
    StoreModule.forFeature(profileFeatureKey, profileReducer),
    EffectsModule.forFeature([PortfolioEffect, NewsEffect, SocialEffect, ProfileEffect])
  ]
})
export class PortfolioModule { }
