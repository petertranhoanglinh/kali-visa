import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterCategoryComponent } from './register-catelogy/register-catelogy.component';

const routes: Routes = [
  {path : 'regcate', component : RegisterCategoryComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
