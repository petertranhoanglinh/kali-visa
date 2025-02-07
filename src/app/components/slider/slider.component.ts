import { AfterViewInit, Component } from '@angular/core';
import { SwiperService } from 'src/app/service/swiper.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements AfterViewInit {
  public sliders = [
    {
      img: 'assets/images/travel/carousel-1.jpg',
      alt: 'Visa Du Lịch Châu Âu',
      title: 'Visa Du Lịch Châu Âu',
      description: 'Trải nghiệm văn hóa, kiến trúc và ẩm thực đa dạng tại các quốc gia Châu Âu.',
      buttonText: 'Đăng ký ngay',
      linkInfo: '/blog/blog-detail/67a0336015554b66d66bd295'
    },
    {
      img: 'assets/images/travel/carousel-2.jpg',
      alt: 'Visa Du Lịch Mỹ',
      title: 'Visa Du Lịch Mỹ',
      linkInfo: '/blog/blog-detail/67a044df15554b66d66bd297',
      description: 'Khám phá những thành phố sôi động và cảnh quan thiên nhiên hùng vĩ tại Mỹ.',
      buttonText: 'Tìm hiểu thêm'
    },
  ];

  public swiperConfig = {
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      type: 'bullets',
      dynamicBullets: true,
    },
    slidesPerView: 1,
    effect: 'fade',
    speed: 1000,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    keyboard: {
      enabled: true,
    },
    grabCursor: true,
    fadeEffect: {
      crossFade: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 1,
      },
      1024: {
        slidesPerView: 1,
      },
    },
  };

  constructor(private _swiperService: SwiperService) { }

  ngAfterViewInit(): void {
    this._swiperService.createSwiper('reviewSwiper', this.swiperConfig);
  }
}
