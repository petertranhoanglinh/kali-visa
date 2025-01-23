import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostFormComponent } from './post-form/post-form.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostListComponent } from './post-list/post-list.component';

const routes: Routes = [
  {path:'blog-edit' , component:PostFormComponent} ,
  {path:'blog-detail/:id' , component:PostDetailComponent},
  {path:'blogs' , component:PostListComponent},
  {path:'blog-edit/:id' , component:PostFormComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostRoutingModule { }
