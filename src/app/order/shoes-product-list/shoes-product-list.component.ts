import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { setShowOverlayLoading } from 'src/app/actions/overlay-loading.action';
import { productAction } from 'src/app/actions/product.action';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { ProductResponseModel } from 'src/app/model/product-response.model';
import { ProductModel } from 'src/app/model/product.model';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';
import { getProducts, ProductState } from 'src/app/selectors/product.selector';

@Component({
  selector: 'app-shoes-product-list',
  templateUrl: './shoes-product-list.component.html',
  styleUrls: ['./shoes-product-list.component.css']
})
export class ShoesProductListComponent implements OnInit {
  items$ = new Observable<ProductResponseModel>();
  items : ProductModel [] = [] ;

  page = 0;
  len  = 6;
  total = 0;
  constructor(private productStore : Store<ProductState> ,
    private overlayLoadingStore: Store<OverlayLoadingState>
  ) {

    this.items$ = this.productStore.select(getProducts);
  }

  ngOnInit( ): void {
    this.loadProduct();
    this.items$.subscribe(res => {
      if (ValidationUtil.isNotNullAndNotEmpty(res)){
        this.items = res.products;
        this.total = res.totalCount;

      }
      setTimeout(() => {
        this.overlayLoadingStore.dispatch(setShowOverlayLoading({loading:false}));
      }, 1000);
    })
  }

  loadProduct():void{
    this.overlayLoadingStore.dispatch(setShowOverlayLoading({loading:true}));
    this.productStore.dispatch(productAction({
      params : {
         page:this.page,
         len : this.len ,

      }
    }))

  }

  handlePageEvent(page:PageEvent){
    this.page = page.pageIndex;
    this.len = page.pageSize;
    this.loadProduct();
  }

}
