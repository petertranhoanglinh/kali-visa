import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { deleteBlog, loadBlogs } from 'src/app/actions/blog.actions';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { BlogModel } from 'src/app/model/blog.model';
import { BlogState, selectAllBlogs } from 'src/app/selectors/blog.selectors';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  blogs: BlogModel[] = [];
  blogs$ = new Observable<BlogModel[]>();
  role = String(AuthDetail.getLoginedInfo()?.role)

  constructor(private blogStore : Store<BlogState> , private toastr: ToastrService ) {
    this.blogs$ = this.blogStore.select(selectAllBlogs)
  }

  ngOnInit(): void {

    this.blogStore.dispatch(loadBlogs())

    this.blogs$.subscribe(res =>{
      if(ValidationUtil.isNotNullAndNotEmpty(res)){
        this.blogs = res;
      }else{
        this.blogs = [];
      }
    })

  }

  deleteBlog(id:string){
    this.blogStore.dispatch(deleteBlog({id:id}))
    this.toastr.info("admin xóa thành công")
    this.blogStore.dispatch(loadBlogs())
  }


}
