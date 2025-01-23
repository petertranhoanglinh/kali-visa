import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { setShowOverlayLoading } from 'src/app/actions/overlay-loading.action';
import { getRewiewsAction, saveProductRewiewAction } from 'src/app/actions/product.action';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { ProductRewiewResponseModel } from 'src/app/model/product-response.model';
import { ProductRewiewModel } from 'src/app/model/product-rewiew.model';
import { ResultModel } from 'src/app/model/result.model';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';
import { getResultSaveRewiew, getRewiews, ProductState } from 'src/app/selectors/product.selector';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-rewiew',
  templateUrl: './product-rewiew.component.html',
  styleUrls: ['./product-rewiew.component.css']
})
export class ProductRewiewComponent implements OnInit {

  @Input() productid:string = '';

  stars = [1, 2, 3, 4, 5];  // Mảng chứa số lượng sao
  rating = 0;               // Giá trị đánh giá hiện tại
  hoverRating = 0;           // Giá trị đánh giá khi rê chuột
  reviewText = '';           // Nội dung đánh giá

  items$ = new Observable<ProductRewiewResponseModel>();
  items : ProductRewiewModel [] = [] ;

  page = 0;
  len  = 6;
  total = 0;
  result$ =  new Observable <ResultModel>();
  imageName:string = '';
  fileImage  : any;
  isPopupOpen: boolean = false;
  productClick:string = ''


  constructor(private toastr: ToastrService ,
    private productStore: Store<ProductState>,
    private overlayLoadingStore: Store<OverlayLoadingState>,
  ) {
    this.items$ = this.productStore.select(getRewiews);
    this.result$ = this.productStore.select(getResultSaveRewiew);
  }

  ngOnInit(): void {
    this.loadRewiews();
    this.items$.subscribe(res => {
      if (ValidationUtil.isNotNullAndNotEmpty(res)){
        this.items = res.rewiews;
        this.total = res.totalCount;

      }
      this.overlayLoadingStore.dispatch(setShowOverlayLoading({loading:false}));
    })

    this.result$.subscribe(res=>{
      if(ValidationUtil.isNotNullAndNotEmpty(res)){
        if(String(res.code) == "200"){
          this.toastr.success(String(res.msg));
          //this.loadRewiews();
        }
      }
    })
  }

   // Khi rê chuột vào sao
   onMouseEnter(index: number) {
    this.hoverRating = index + 1;
  }

  // Khi rê chuột ra ngoài sao
  onMouseLeave() {
    this.hoverRating = 0;
  }

  // Khi click để đánh giá sao
  rate(index: number) {
    this.rating = index + 1;
  }

    // Gửi đánh giá
  submitReview() {
    if(!ValidationUtil.isNotNullAndNotEmpty(this.reviewText)){
      this.toastr.warning("Comment not empty")
      return;
    }
    console.log(`Review: ${this.reviewText}`);
    console.log(`Rating: ${this.rating}`);
    this.productStore.dispatch(saveProductRewiewAction({
      params : {
        productid:this.productid,
        cmt:this.reviewText,
        rating:this.rating,
        userid:String(AuthDetail.getLoginedInfo()?.email)
      } ,
      file :this.fileImage
    }))
  }

  loadRewiews():void{
    this.overlayLoadingStore.dispatch(setShowOverlayLoading({loading:true}));
    this.productStore.dispatch(getRewiewsAction({
      params : {
         page:this.page,
         len : this.len ,
         productid:this.productid

      }
    }))

  }

  handlePageEvent(page:PageEvent){
    this.page = page.pageIndex;
    this.len = page.pageSize;
    this.loadRewiews();
  }

  changeFileName(file:File){
    this.imageName = file.name
    this.fileImage = file;
  }

  getImageUrl(imageName: string): string {
    // Giả sử hình ảnh của bạn được lưu trữ trên server và bạn có một đường dẫn cố định cho chúng
    const baseUrl = environment.apiUrl + '/';
    return `${baseUrl}${imageName}`;
  }

  closePopup():void{
    this.isPopupOpen = false;
  }

  clickProduct(item:ProductRewiewModel){
    this.isPopupOpen = true;
    const baseUrl = environment.apiUrl + '/';
    const imgName = `${baseUrl}${item.imageName}`;
    this.productClick = imgName;
  }


}
