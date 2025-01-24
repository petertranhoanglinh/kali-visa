import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SwiperService } from 'src/app/service/swiper.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent   implements OnInit  {

    constructor(
      private _swiperService: SwiperService ) {
    }
  ngOnInit(): void {
    setTimeout(() => {
      this._swiperService.createSwiper(
        'reviewSwiper',
        this.swiperConfig
      );
    }, 1000);
  }



  brands = [
    {
      img: 'assets/images/travel/carousel-1.jpg',
      alt: 'Visa Du Lịch Châu Âu',
      title: 'Visa Du Lịch Châu Âu',
      description: 'Trải nghiệm văn hóa, kiến trúc và ẩm thực đa dạng tại các quốc gia Châu Âu.',
      buttonText: 'Đăng ký ngay'
    },
    {
      img: 'assets/images/travel/carousel-2.jpg',
      alt: 'Visa Du Lịch Mỹ',
      title: 'Visa Du Lịch Mỹ',
      description: 'Khám phá những thành phố sôi động và cảnh quan thiên nhiên hùng vĩ tại Mỹ.',
      buttonText: 'Tìm hiểu thêm'
    },
    {
      img: 'assets/images/travel/carousel-3.jpg',
      alt: 'Visa Du Lịch Nhật Bản',
      title: 'Visa Du Lịch Nhật Bản',
      description: 'Trải nghiệm văn hóa truyền thống và hiện đại tại đất nước mặt trời mọc.',
      buttonText: 'Xem chi tiết'
    }
  ];

  swiperConfig = {
    loop: true, // Lặp lại slider
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true, // Cho phép click vào pagination để chuyển slide
      type: 'bullets', // Hiển thị dạng chấm
      dynamicBullets: true, // Chấm pagination co giãn khi hover
    },
    slidesPerView: 1, // Hiển thị 1 slide tại một thời điểm
    effect: 'fade', // Hiệu ứng fade giữa các slide
    speed: 1000, // Tốc độ chuyển slide (1 giây)
    autoplay: {
      delay: 5000, // Tự động chuyển slide sau 5 giây
      disableOnInteraction: false, // Tiếp tục autoplay sau khi tương tác
      pauseOnMouseEnter: true, // Tạm dừng autoplay khi hover
    },
    keyboard: {
      enabled: true, // Cho phép điều khiển slider bằng bàn phím
    },
    grabCursor: true, // Hiển thị con trỏ grab khi hover
    fadeEffect: {
      crossFade: true, // Hiệu ứng fade mượt mà
    },
    breakpoints: {
      // Tùy chỉnh số slide hiển thị trên các kích thước màn hình khác nhau
      768: {
        slidesPerView: 1,
      },
      1024: {
        slidesPerView: 1,
      },
    },
  };

}
