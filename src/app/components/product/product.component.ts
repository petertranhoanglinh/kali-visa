import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { CartService } from './../../service/cart-service.service';
import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ProductModel } from 'src/app/model/product.model';

@Component({
  selector: '[product]',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  @Input() product:ProductModel = {} as ProductModel
  @Input() reviewCount:number = 0;
  apiUrl = environment.apiUrl;
  constructor(private cartService : CartService
    , private toastr: ToastrService
    , private router: Router) {

  }
  private isNavigating = false; // Thêm flag kiểm tra

  ngOnInit(): void {

  }

  clickBuy(item:ProductModel):void{
    const id =  AuthDetail.getLoginedInfo()?.id;

    this.cartService.addToCart(String(id), item, 1 );

    this.toastr.success("Add Cart suscess")


  }



  async handleLink() {
    // Kiểm tra nếu đang trong quá trình điều hướng thì return
    if (this.isNavigating) {
      return;
    }

    try {
      this.isNavigating = true; // Đặt flag

      if (!this.product?.id) {
        this.toastr.error('Không tìm thấy thông tin sản phẩm');
        return;
      }

      // Sử dụng Promise để handle navigation
      await this.router.navigate(["/shopping/detail", this.product.id]);

    } catch (error) {
      console.error('Navigation error:', error);
      this.toastr.error('Có lỗi xảy ra khi chuyển trang');
    } finally {
      this.isNavigating = false; // Reset flag
    }
  }



}
