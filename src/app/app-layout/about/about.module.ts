import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutCompanyComponent } from './about-company/about-company.component';
import { AboutRoutingModule } from './about.routing.module';
import { AboutStoryComponent } from './about-story/about-story.component';
import { ContactComponent } from './contact/contact.component';
@NgModule({
  declarations: [AboutCompanyComponent , AboutStoryComponent , ContactComponent],
  imports: [
    CommonModule,
    AboutRoutingModule
  ]
})
export class AboutModule { }
