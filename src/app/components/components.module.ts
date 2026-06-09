import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableTemplateComponent } from './table-template/table-template.component';
import { PagingComponent } from './paging/paging.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PopupComponent } from './popup/popup.component';
import { ProductComponent } from './product/product.component';
import { PipeModule } from '../pipe/pipe.module';
import { SliderComponent } from './slider/slider.component';
import { MessageButtonComponent } from './message-button/message-button.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { FriendChatTabsComponent } from './friend-chat-tabs/friend-chat-tabs.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TableTemplateComponent,
    PagingComponent,
    ImageUploadComponent,
    PageNotFoundComponent,
    PopupComponent,
    ProductComponent,
    SliderComponent,
    MessageButtonComponent,
    ChatBoxComponent,
    FriendChatTabsComponent
  ],
  imports: [
    CommonModule,
    PipeModule,
    FormsModule
  ]
  ,
  exports:[
    TableTemplateComponent,
    ImageUploadComponent,
    PagingComponent,
    PopupComponent,
    ProductComponent,
    SliderComponent,
    MessageButtonComponent,
    ChatBoxComponent,
    FriendChatTabsComponent
  ],
})
export class ComponentsModule { }
