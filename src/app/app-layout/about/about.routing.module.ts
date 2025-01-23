import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutCompanyComponent } from './about-company/about-company.component';
import { AboutStoryComponent } from './about-story/about-story.component';
import { ContactComponent } from './contact/contact.component';

const routes: Routes = [
  {path:"about-company" , component:AboutCompanyComponent},
  {path:"about-story" , component:AboutStoryComponent},
  {path:"contact" , component:ContactComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutRoutingModule { }
