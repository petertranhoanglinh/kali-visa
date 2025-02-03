import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostRoutingModule } from './post-routing.module';

import { ComponentsModule } from 'src/app/components/components.module';
import { PostFormComponent } from './post-form/post-form.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule } from '@angular/forms';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { blogReducer } from 'src/app/reducers/blog.reducer';
import { BlogEffects } from 'src/app/effects/blog.effects';
import { PostListComponent } from './post-list/post-list.component';
import { PostAdminComponent } from './post-admin/post-admin.component';
@NgModule({
  declarations: [PostFormComponent, PostDetailComponent, PostListComponent, PostAdminComponent],
  imports: [
    CommonModule,
    PostRoutingModule,
    ComponentsModule,
    CKEditorModule,
    FormsModule,
    StoreModule.forFeature("blog",blogReducer),
    EffectsModule.forFeature([BlogEffects]),
  ]
})
export class PostModule { }
