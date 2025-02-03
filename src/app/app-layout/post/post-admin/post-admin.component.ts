import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { deleteBlog, loadBlogs } from 'src/app/actions/blog.actions';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { BlogResponseModel } from 'src/app/model/blog-response.model';
import { BlogModel } from 'src/app/model/blog.model';
import { TableConfig } from 'src/app/model/table-config';
import { BlogState, selectAllBlogs } from 'src/app/selectors/blog.selectors';


@Component({
  selector: 'app-post-admin',
  templateUrl: './post-admin.component.html',
  styleUrls: ['./post-admin.component.css']
})
export class PostAdminComponent implements OnInit {

   blogs: BlogModel[] = [];
   blogs$ = new Observable<BlogResponseModel>();
   role = String(AuthDetail.getLoginedInfo()?.role)
   page = 0;
   len  = 8;
   total = 0;

     config: TableConfig = {
       columns: [
         { header: "Tên Bài Viết", field: "title" },
         { header: "Tác Giả", field: "author" },
         { header: "Ngày Đăng Bài", field: "createdAt" },
         { header: "Ngày Cập Nhật Bài", field: "updateAt" },
         { header: "Mô tảtả", field: "description" },

       ]

     }

   constructor(private blogStore : Store<BlogState> , private toastr: ToastrService , private router: Router ) {
     this.blogs$ = this.blogStore.select(selectAllBlogs)
   }

   ngOnInit(): void {

     this.blogStore.dispatch(loadBlogs({
       params : {
          page:this.page,
          len : this.len
       }
     }))

     this.blogs$.subscribe(res =>{
       if(ValidationUtil.isNotNullAndNotEmpty(res)){
         this.blogs = res.blog;
         this.total = res.totalCount;
       }else{
         this.blogs = [];
       }
     })

   }

   deleteBlog(id:string){
     this.blogStore.dispatch(deleteBlog({id:id}))
     this.toastr.info("admin xóa thành công")
     this.blogStore.dispatch(loadBlogs({
       params : {
          page:this.page,
          len : this.len ,

       }
     }))
   }

   handlePageEvent(page:PageEvent){
       this.page = page.pageIndex;
       this.len = page.pageSize;
       this.blogStore.dispatch(loadBlogs({
         params : {
            page:this.page,
            len : this.len
         }
       }))
     }

    async  clickRow(item: any) {
      await this.router.navigate(["blog/blog-detail", item.id]);

    }
    async handleEdit(item:any){
      await this.router.navigate(["blog/blog-edit", item.id]);

    }

    async handleDelete(item:any){
      this.deleteBlog(item.id)

    }


}
