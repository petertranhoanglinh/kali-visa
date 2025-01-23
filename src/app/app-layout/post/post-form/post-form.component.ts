import { Component, OnInit } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'; // Sử dụng ClassicEditor
import '@ckeditor/ckeditor5-alignment/build/translations/vi';
import { BlogModel } from 'src/app/model/blog.model';
import { environment } from 'src/environments/environment';

import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { Observable } from 'rxjs';
import { State, Store } from '@ngrx/store';
import { BlogState, selectSelectedBlog, selectSelectedSaveBlog } from 'src/app/selectors/blog.selectors';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { ToastrService } from 'ngx-toastr';
import { createBlog, createBlogSuccess, loadBlogById } from 'src/app/actions/blog.actions';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent implements OnInit {


  public Editor = DecoupledEditor as any;
  blog: BlogModel = {} as BlogModel;

  blog$ = new Observable<BlogModel>();
  blogDetail$ = new Observable<BlogModel>();



  public editorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'fontFamily',
        'fontSize',
        '|',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'alignment', // Đảm bảo rằng tùy chọn căn chỉnh có ở đây
        'indent',
        'outdent',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'link',
        'imageUpload',
        'blockQuote',
        'insertTable',
        '|',
        'undo',
        'redo'
      ]
    },
    image: {
      upload: {
        types: ['jpeg', 'png', 'gif', 'jpg']
      },
      resizeUnit: 'px',  // Đơn vị thay đổi kích thước là pixel
      resizeOptions: [
        { name: 'resizeImage:original', value: null, icon: 'original' },
        { name: 'resizeImage:50', value: '50', icon: 'small' },
        { name: 'resizeImage:75', value: '75', icon: 'medium' },
        { name: 'resizeImage:100', value: '100', icon: 'large' }]
    },
    ckfinder: {
      uploadUrl: environment.apiUrl + '/api/products/upload-editor',
    },
    fontFamily: {
      options: [
        'Arial',
        'Times New Roman',
        'Helvetica',
        'Courier New',
        'Roboto'
      ],
      default: 'Times New Roman'
    },
    fontSize: {
      options: [
        9,
        11,
        13,
        17,
        19,
        21
      ],
      default: 13
    },
    alignment: {
      options: ['left', 'right', 'center', 'justify'] // Đảm bảo bạn có các tùy chọn căn chỉnh
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableCellProperties',
        'tableProperties'
      ]
    }
  };

  constructor(private blogStore : Store<BlogState> , private toastr: ToastrService   , private route: ActivatedRoute){
    this.blog$ = this.blogStore.select(selectSelectedSaveBlog);
    this.blogDetail$ = this.blogStore.select(selectSelectedBlog);

  }
  ngOnInit(): void {

    const id  = this.route.snapshot.paramMap.get('id');
    if(id != null){
      this.blogStore.dispatch(loadBlogById({id:String(id)}))
    }
    this.blogDetail$.subscribe(res =>{
      if(ValidationUtil.isNotNullAndNotEmpty(res.id)){
        this.blog = res;
      }
    })
    this.blog$.subscribe(res => {
      if(ValidationUtil.isNotNullAndNotEmpty(res.id)){
        this.toastr.info("save post susccess")
      }
    })
  }

  submitForm() {
    this.blogStore.dispatch(createBlog({blog : this.blog}))
    console.log('Dữ liệu bài viết:', this.blog);
  }

  onReady(editor: any): void {
    const toolbarElement = editor.ui.view.toolbar.element;
    const editableElement = editor.ui.getEditableElement();

    // Thêm toolbar vào DOM
    editableElement.parentElement.insertBefore(toolbarElement, editableElement);
  }

  ngOnDestroy(): void {
    this.blogStore.dispatch(createBlogSuccess({blog: {} as BlogModel}))
  }
}


