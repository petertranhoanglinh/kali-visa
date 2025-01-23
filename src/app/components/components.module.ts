import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableTemplateComponent } from './table-template/table-template.component';
import { PagingComponent } from './paging/paging.component';
import { MeterialModule } from '../meterial/meterial.module';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PopupComponent } from './popup/popup.component';
import { ProductComponent } from './product/product.component';
import { PipeModule } from '../pipe/pipe.module';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';
import { SliderComponent } from './slider/slider.component';
@NgModule({
  declarations: [
    TableTemplateComponent,
    PagingComponent,
    ImageUploadComponent,
    PageNotFoundComponent,
    PopupComponent,
    ProductComponent,
    CustomDialogComponent,
    SliderComponent


  ],
  imports: [
    CommonModule,
    MeterialModule,
    PipeModule

  ]
  ,
  exports:[
    TableTemplateComponent,
    ImageUploadComponent,
    PagingComponent,
    PopupComponent,
    ProductComponent,
    SliderComponent
  ],
})
export class ComponentsModule { }
