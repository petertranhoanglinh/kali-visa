import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { getProducts, ProductState } from '../selectors/product.selector';
import { productAction } from '../actions/product.action';
import { ProductResponseModel } from '../model/product-response.model';
import { ProductModel } from '../model/product.model';
import { environment } from 'src/environments/environment';
import { SwiperService } from '../service/swiper.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit ,  AfterViewInit {
  @ViewChild('anchor', { static: false }) anchor!: ElementRef;

  items$: Observable<ProductResponseModel>;
  items: ProductModel[] = [];
  page = 0;
  len = 24;
  loading = false; // Trạng thái đang tải
  apiUrl = environment.apiUrl;

  observer!: IntersectionObserver;
  constructor(private productStore: Store<ProductState>
    , private _swiperService: SwiperService ,
     private router: Router) {
    this.items$ = this.productStore.select(getProducts);
  }

  ngOnInit(): void {

    this.loadProduct();
    this.items$.subscribe((res) => {
      if (res && res.products.length) {
        this.items = [...this.items, ...res.products].slice(0,6); // Gộp sản phẩm mới vào danh sách
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Di chuyển setup observer vào đây
    this.setupObserver();
  }

  loadProduct(): void {
    this.loading = true;
    this.productStore.dispatch(
      productAction({
        params: {
          page: this.page,
          len: this.len,
        },
      })
    );
  }

  setupObserver(): void {
    const options = {
      root: null, // Theo dõi viewport
      threshold: 0.1, // Kích hoạt khi anchor vào 10% viewport
    };

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.loading) {
        this.page++;
        this.loadProduct(); // Gọi API tải thêm sản phẩm
      }
    }, options);

    this.observer.observe(this.anchor.nativeElement); // Quan sát anchor
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  async handleLink(item: ProductModel) {
    // Kiểm tra nếu đang trong quá trình điều hướng thì return


    try {


      if (!item?.id) {
        return;
      }

      // Sử dụng Promise để handle navigation
      await this.router.navigate(["/du-an/chi-tiet/", item.id]);

    } catch (error) {

    } finally {

    }
  }
}
