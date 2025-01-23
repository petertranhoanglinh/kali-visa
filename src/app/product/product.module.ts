import { RegisterCategoryComponent } from './register-catelogy/register-catelogy.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductRoutingModule } from './product-routing.module';


@NgModule({
  declarations: [
    RegisterCategoryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductRoutingModule
  ]
})
export class ProductModule { }
