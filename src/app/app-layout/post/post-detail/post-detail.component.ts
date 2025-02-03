import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadBlogById, loadBlogByIdSuccess } from 'src/app/actions/blog.actions';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { BlogModel } from 'src/app/model/blog.model';
import { BlogState, selectSelectedBlog } from 'src/app/selectors/blog.selectors';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailComponent implements OnInit {

  blog: BlogModel = {} as BlogModel;
  blog$ = new Observable<BlogModel>();
  constructor(private sanitizer: DomSanitizer , private route: ActivatedRoute , private blogStore : Store<BlogState>) {
    this.blog$ = this.blogStore.select(selectSelectedBlog)
   }
  ngOnInit(): void {
    const id  = this.route.snapshot.paramMap.get('id');
    this.blogStore.dispatch(loadBlogById({id:String(id)}))
    this.blog$.subscribe(res =>{
      if(ValidationUtil.isNotNullAndNotEmpty(res.id)){
        this.blog = res;
        this.addLazyLoadingToImages();
        window.scrollTo(0, 0);
      }
    })
  }

  ngOnDestroy(): void {
    this.blogStore.dispatch(loadBlogByIdSuccess({blog: {} as BlogModel}))
  }

  get sanitizedContent() {
    this.addLazyLoadingToImages();
    return this.sanitizer.bypassSecurityTrustHtml(this.blog.content);
  }

  addLazyLoadingToImages() {
    const imgRegex = /<img\s+([^>]+)>/g;
    this.blog.content = this.blog.content .replace(imgRegex, (match: string, group: string) => {
      // Thêm hoặc thay đổi thuộc tính "loading" thành "lazy"
      if (!group.includes('loading="lazy"')) {
        return `<img ${group} loading="lazy">`;
      }
      return match; // Nếu đã có thuộc tính "lazy", giữ nguyên
    });
  }





}
