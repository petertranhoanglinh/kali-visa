import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { CheckoutComponent } from './checkout.component';
import { StoreModule } from '@ngrx/store';
import { orderFeatureKey, orderReducer } from 'src/app/reducers/order.reducer';
import { EffectsModule } from '@ngrx/effects';
import { OrderEffect } from 'src/app/effects/order.effect';
import { PipeModule } from 'src/app/pipe/pipe.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { productFeatureKey, productReducer } from 'src/app/reducers/product.reducer';
import { ProductEffect } from 'src/app/effects/product.effect';
import { CoinPaymentComponent } from './coin-payment/coin-payment.component';
@NgModule({
  declarations: [CheckoutComponent, CoinPaymentComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    ComponentsModule,
    StoreModule.forFeature(productFeatureKey,productReducer),
    EffectsModule.forFeature([ProductEffect]),
    StoreModule.forFeature(orderFeatureKey, orderReducer),
    EffectsModule.forFeature([OrderEffect]),
  ]
})
export class CheckoutModule { }
