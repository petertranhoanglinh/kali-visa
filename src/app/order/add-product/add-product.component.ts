import { PageEvent } from '@angular/material/paginator';
import { ResultModel } from './../../model/result.model';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/internal/Observable';
import { productAction, productActionSuscess, saveProductAction, saveProductActionSuscess } from 'src/app/actions/product.action';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { ProductResponseModel } from 'src/app/model/product-response.model';
import { ProductModel } from 'src/app/model/product.model';
import { TableConfig } from 'src/app/model/table-config';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';
import { getProducts, getResultSaveProduct, ProductState } from 'src/app/selectors/product.selector';
import { ProductService } from 'src/app/service/product.service';
import { environment } from 'src/environments/environment';

import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {

    public Editor = DecoupledEditor as any;

  apiUrl : string = environment.apiUrl;

  product = {
    id: null,
    name: '',
    price: null,
    stock: 100000,
    description: '',
    content: '',
    visaType:'',
    sale: false,
    new: false,
    best: false,
    rate: 0,
    keyword:'',
    services:'',
    timeDate:'',
  };
  img: any = '';
  slider1: any = '';
  slider2: any = '';
  slider3: any = '';
  slider4: any = '';
  slider5: any = '';
  slider6: any = '';

  imgName: any = '';
  sliderName1: any = '';
  sliderName2: any = '';
  sliderName3: any = '';
  sliderName4: any = '';
  sliderName5: any = '';
  sliderName6: any = '';
  result$ =  new Observable <ResultModel>();

  config: TableConfig = {
    columns: [
      { header: "Product Name", field: "name" },
      { header: "Price", field: "price" },
      { header: "Rate Sale", field: "rateShow" },
      { header: "Price Sale", field: "priceSaleShow" },
      { header: "Stock", field: "stock" },

    ]

  }

  isPopupOpen = false;

  items$ = new Observable<ProductResponseModel>();
  items: ProductModel[] = [];

  page = 0;
  len = 5;
  total = 0;


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

  @ViewChild('content', { static: false }) content!: ElementRef;



  constructor( private productStore: Store<ProductState>,
               private toastr: ToastrService ,
               private overlayLoadingStore: Store<OverlayLoadingState>,
  ) {

    this.result$ = this.productStore.select(getResultSaveProduct);
    this.items$ = this.productStore.select(getProducts);


  }


  ngOnInit(): void {
    this.loadProduct();
    this.result$.subscribe(res=>{
      if(ValidationUtil.isNotNullAndNotEmpty(res)){
        if(String(res.code) == "200"){
          this.resetForm();
          this.toastr.success(String(res.msg));
        }
      }
    })

    this.items$.subscribe(res => {
      if (ValidationUtil.isNotNullAndNotEmpty(res)) {
        this.items = res.products;
        this.total = res.totalCount;

        this.items = this.items.map(item => ({
          ...item,
          rateShow: String((item.rate * 100).toFixed(2) ) + "%"
          , priceSaleShow : String(  ((1-item.rate)*item.price).toFixed(2)     )  // Thực hiện phép tính và lưu vào đối tượng
        }));

      }
    })
  }

  changeFileName(file: File, kind: String) {
    switch (kind) {
      case 'img':
        this.img = file;
        this.imgName = file.name;
        break;
      case 'slider1':
        this.slider1 = file;
        this.sliderName1 = file.name;

        break;
      case 'slider2':
        this.slider2 = file;
        this.sliderName2 = file.name;
        break;
      case 'slider3':
        this.slider3 = file;
        this.sliderName3 = file.name;
        break;
      case 'slider4':
        this.slider4 = file;
        this.sliderName4 = file.name;
        break;
      case 'slider5':
        this.slider5 = file;
        this.sliderName5 = file.name;
        break;
      case 'slider6':
        this.slider6 = file;
        this.sliderName6 = file.name;
        break;
      default:
        break;
    }

  }

  ngOnDestroy(): void {
    this.productStore.dispatch(saveProductActionSuscess({ result : {} as ResultModel}))
  }

  onSubmit(){

    if(!ValidationUtil.isNotNullAndNotEmpty(this.product.name)){
      this.toastr.warning("Product Name not empty")
      return;
    }
    if(!ValidationUtil.isNotNullAndNotEmpty(this.product.price)){
      this.toastr.warning("Product price not empty")
      return;
    }
    if(!ValidationUtil.isNotNullAndNotEmpty(this.product.stock)){
      this.toastr.warning("Product stock not empty")
      return;
    }

    let sliders : any [] = [];
    if(ValidationUtil.isNotNullAndNotEmpty(this.slider1)){
      sliders.push(this.slider1);
    }
    if(ValidationUtil.isNotNullAndNotEmpty(this.slider2)){
      sliders.push(this.slider2);
    }

    if(ValidationUtil.isNotNullAndNotEmpty(this.slider3)){
      sliders.push(this.slider3);
    }

    if(ValidationUtil.isNotNullAndNotEmpty(this.slider4)){
      sliders.push(this.slider4);
    }
    let params = {};





    if(ValidationUtil.isNotNullAndNotEmpty(this.product.id)){

       let slidersName : string [] = [];
       if(ValidationUtil.isNotNullAndNotEmpty(this.sliderName1)){
        slidersName.push(this.sliderName1.replace(this.apiUrl + '/' , '' ))
       }
       if(ValidationUtil.isNotNullAndNotEmpty(this.sliderName2)){
        slidersName.push(this.sliderName2.replace(this.apiUrl + '/' , ''))
       }
       if(ValidationUtil.isNotNullAndNotEmpty(this.sliderName3)){
        slidersName.push(this.sliderName3.replace(this.apiUrl + '/' , ''))
       }
       if(ValidationUtil.isNotNullAndNotEmpty(this.sliderName4)){
        slidersName.push(this.sliderName4.replace(this.apiUrl + '/' ,'' ))
       }

       if(ValidationUtil.isNotNullAndNotEmpty(this.sliderName5)){
        slidersName.push(this.sliderName5.replace(this.apiUrl + '/' ,'' ))
       }
       if(ValidationUtil.isNotNullAndNotEmpty(this.sliderName6)){
        slidersName.push(this.sliderName6.replace(this.apiUrl + '/' ,'' ))
       }

       let img = '';
       if(ValidationUtil.isNotNullAndNotEmpty(this.imgName)){
        img = this.imgName.replace(this.apiUrl + '/' , '' )
       }else{
        img = '';
       }
       params = {
        id : this.product.id,
        name: this.product.name,
        price: this.product.price,
        stock: this.product.stock,
        description: this.product.description,
        sale: this.product.sale,
        new: this.product.new,
        best: this.product.best ,
        img : img,
        sliders : slidersName,
        rate:this.product.rate/100,
        content:this.product.content,
        visaType : this.product.visaType,
        keyword : this.product.keyword,
        services: this.product.services,
        timeDate: this.product.timeDate


      }
    }else{
      params = {
        id : null,
        name: this.product.name,
        price: this.product.price,
        stock: this.product.stock,
        description: this.product.description,
        sale: this.product.sale,
        new: this.product.new,
        best: this.product.best,
        rate:this.product.rate/100,
        content:this.product.content,
        visaType : this.product.visaType,
        keyword : this.product.keyword,
        services: this.product.services,
        timeDate: this.product.timeDate
      }
    }

    this.productStore.dispatch(saveProductAction({
      params : params,
      img : this.img,
      sliders: sliders
    }))

  }

  resetForm() {
    this.product = {
      id: null,
      name: '',
      price: null,
      stock: 0,
      description: '',
      sale: false,
      new: false,
      best: false,
      rate:0,
      content:'',
      visaType: '',
      keyword:'',
      services:'',
      timeDate:'',
    };

    // Reset the image and slider fields
    this.img = '';
    this.slider1 = '';
    this.slider2 = '';
    this.slider3 = '';
    this.slider4 = '';
    this.slider5 = '';
    this.slider6 = '';

    // Reset the file name fields
    this.imgName = '';
    this.sliderName1 = '';
    this.sliderName2 = '';
    this.sliderName3 = '';
    this.sliderName4 = '';
    this.sliderName5 = '';
    this.sliderName6 = '';

  }

  openPopup(): void {
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
  }

  handlePageEvent(page: PageEvent) {
    this.page = page.pageIndex;
    this.len = page.pageSize;
    this.loadProduct();
  }

  loadProduct(): void {
    this.productStore.dispatch(productAction({
      params: {
        page: this.page,
        len: this.len,

      }
    }))


  }

  clickRow(item: any) {
    this.isPopupOpen = false;
    this.product = {
      id: item.id,
      name:item.name,
      price: item.price,
      stock: item.stock,
      description: item.description,
      sale: item.sale,
      new: item.new,
      best: item.best,
      rate:item.rate * 100,
      content:item.content,
      visaType:item.visaType,
      keyword:item.keyword,
      services:item.services,
      timeDate:item.timeDate
    };

    if(ValidationUtil.isNotNullAndNotEmpty(item.img)){
      this.imgName =  item.img

    }

    if(ValidationUtil.isNotNullAndNotEmpty(item.sliders)){
      for (let i = 0; i < item.sliders.length; i++) {
        const sliderUrl =    item.sliders[i];
        switch (i) {
          case 0:
            this.sliderName1 = sliderUrl;
            break;
          case 1:
            this.sliderName2 = sliderUrl;
            break;
          case 2:
            this.sliderName3 = sliderUrl;
            break;
          case 3:
            this.sliderName4 = sliderUrl;
            break;
          default:
            break;
        }
      }

    }

    if (this.content) {
      this.content.nativeElement.innerHTML = item.content || '';
    }
  }

  onReady(editor: any): void {
    const toolbarElement = editor.ui.view.toolbar.element;
    const editableElement = editor.ui.getEditableElement();

    // Thêm toolbar vào DOM
    editableElement.parentElement.insertBefore(toolbarElement, editableElement);
  }

}
