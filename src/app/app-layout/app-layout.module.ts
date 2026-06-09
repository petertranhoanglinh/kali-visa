import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppLayoutRoutingModule } from './app-layout-routing.module';
import { HeaderComponent } from './header/header.component';
import { AppLayoutComponent } from './app-layout.component';
import { StoreModule } from '@ngrx/store';
import { overlayLoadingFeatureKey, overlayLoadingReducer } from '../reducers/overlay-loading.reducer';
import { EffectsModule } from '@ngrx/effects';
import { NgxLoadingModule } from 'ngx-loading';
import { ComponentsModule } from '../components/components.module';
import { TabulatorTableComponent } from '../components/tabulator-table/tabulator-table.component';
import { headerFeatureKey, headerReducer } from '../reducers/header.reducer';
import { LoginModule } from './login/login.module';
import { AutoLoginComponent } from './auto-login/auto-login.component';
import { PostComponent } from './post/post.component';
import { CoinEffect } from '../effects/coin.effect';
import { coinFeatureKey, coinReducer } from '../reducers/coin.reducer';
import { HomePageComponent } from '../home-page/home-page.component';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { QRCodeModule } from 'angularx-qrcode';
import { PageHeadingComponent } from './page-heading/page-heading.component';
import { messageFeatureKey, messageReducer } from '../reducers/message.reducer';
import { MessageEffect } from '../effects/message.effect';
@NgModule({
  declarations: [
    AppLayoutComponent,
    AutoLoginComponent,
    PostComponent,
    HomePageComponent,
    HeaderComponent,
    PageHeadingComponent
  ],
  imports: [
    CommonModule,
    AppLayoutRoutingModule,
    TabulatorTableComponent,
    ComponentsModule,
    FormsModule,
    LoginModule,
    ReactiveFormsModule,
    NgChartsModule,
    QRCodeModule,
    NgxLoadingModule.forRoot({fullScreenBackdrop: true}),
    StoreModule.forFeature(overlayLoadingFeatureKey, overlayLoadingReducer),
    StoreModule.forFeature(headerFeatureKey, headerReducer),

    StoreModule.forFeature(coinFeatureKey,coinReducer),
    EffectsModule.forFeature([CoinEffect]),
     StoreModule.forFeature(messageFeatureKey,messageReducer),
        EffectsModule.forFeature([MessageEffect]),
  ]
})
export class AppLayoutModule { }
