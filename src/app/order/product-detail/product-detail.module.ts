import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductDetailComponent } from './product-detail.component';
import { PipeModule } from 'src/app/pipe/pipe.module';
import { StoreModule } from '@ngrx/store';
import { productFeatureKey, productReducer } from 'src/app/reducers/product.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ProductEffect } from 'src/app/effects/product.effect';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { ProductRewiewComponent } from './product-rewiew/product-rewiew.component';
@NgModule({
  declarations: [ProductDetailComponent, ProductRewiewComponent],
  imports: [
    CommonModule,
    PipeModule,
    FormsModule,
    ComponentsModule,
    StoreModule.forFeature(productFeatureKey,productReducer),
    EffectsModule.forFeature([ProductEffect]),

  ],


})
export class ProductDetailModule { }
