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

  swiperConfig = {
    loop: true, // Lặp lại các slide
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true, // Dynamic pagination bullets
    },
    slidesPerView: 1, // Hiển thị 1 slide tại một thời điểm
    effect: 'slide', // Hiệu ứng trượt
    autoplay: {
      delay: 5000, // Tự động chuyển slide sau 5 giây
      disableOnInteraction: false,
    },
    spaceBetween: 10, // Khoảng cách giữa các slide
    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 10 }, // Điện thoại nhỏ
      480: { slidesPerView: 1, spaceBetween: 15 }, // Điện thoại lớn
      768: { slidesPerView: 1, spaceBetween: 20 }, // Tablet
      1024: { slidesPerView: 1, spaceBetween: 25 }, // Laptop nhỏ
      1440: { slidesPerView: 1, spaceBetween: 30 }, // Màn hình lớn
    },
  };

  brands = [
    { img: 'assets/images/demos/demo-2/slider/slide-1.jpg', alt: 'Brand 1' },
    { img: 'assets/images/demos/demo-2/slider/slide-2.jpg', alt: 'Brand 2' },
    { img: 'assets/images/demos/demo-2/slider/slide-3.jpg', alt: 'Brand 3' },
  ];
  constructor(private productStore: Store<ProductState>
    , private _swiperService: SwiperService ,
     private router: Router) {
    this.items$ = this.productStore.select(getProducts);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this._swiperService.createSwiper(
        'reviewSwiper',
        this.swiperConfig
      );
    }, 1000);
    this.loadProduct();
    this.items$.subscribe((res) => {
      if (res && res.products.length) {
        this.items = [...this.items, ...res.products]; // Gộp sản phẩm mới vào danh sách
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
