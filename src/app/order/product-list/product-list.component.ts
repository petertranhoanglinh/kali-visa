import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs/internal/Observable';
import { setShowOverlayLoading } from 'src/app/actions/overlay-loading.action';
import { productAction } from 'src/app/actions/product.action';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { ProductResponseModel } from 'src/app/model/product-response.model';
import { ProductModel } from 'src/app/model/product.model';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';
import { getProducts, ProductState } from 'src/app/selectors/product.selector';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit , OnDestroy , AfterViewInit   {

  items$ = new Observable<ProductResponseModel>();
  items : ProductModel [] = [] ;

  customOptions: OwlOptions ={
    nav: false,
    dots: true,
    margin: 30,
    loop: false,
    responsive: {
      0: {
        items: 2
      },
      420: {
        items: 3
      },
      600: {
        items: 4
      },
      900: {
        items: 5
      },
      1024: {
        items: 6,
        nav: true,
        dots: false
      }
    }
  };


  page = 0;
  len  = 6;
  total = 0;
  countRewiew = 0;
  constructor(private productStore : Store<ProductState> ,
    private overlayLoadingStore: Store<OverlayLoadingState>,
    private cdr: ChangeDetectorRef
  ) {

    this.items$ = this.productStore.select(getProducts);
  }

  ngOnInit( ): void {
    this.loadProduct();
    this.items$.subscribe(res => {
      if (ValidationUtil.isNotNullAndNotEmpty(res)){
        this.items = res.products;
        this.total = res.totalCount;
        this.countRewiew = res.countRewiew;

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
  ngOnDestroy(): void {
    const carousel = document.querySelector('owl-carousel-o');
    if (carousel) {
      carousel.dispatchEvent(new CustomEvent('destroy'));
    }
  }

  ngAfterViewInit(): void {
    // Force carousel to re-render
    setTimeout(() => {
      const carousel = document.querySelector('owl-carousel-o');
      if (carousel) {
        // Re-initialize OwlCarousel
        carousel.dispatchEvent(new CustomEvent('reinitialize'));
      }
    }, 0);
  }



}
