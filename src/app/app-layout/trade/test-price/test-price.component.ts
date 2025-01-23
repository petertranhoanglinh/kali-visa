import { Component, OnInit } from '@angular/core';
import { Data } from 'src/app/model/data.model';
import { PaymentServiceService } from 'src/app/service/payment-service.service';
import { WebSocketService } from 'src/app/service/web-socket-service.service';

@Component({
  selector: 'app-test-price',
  templateUrl: './test-price.component.html',
  styleUrls: ['./test-price.component.css']
})
export class TestPriceComponent implements OnInit {



  constructor(private paymentService: PaymentServiceService) { }

  ngOnInit() {


  }


  paymentRequest = {
    vnp_OrderInfo: 'Sample Order Information',
	  ordertype:   'sale',
	  amount:   100000,
	  bankcode:   'VNQRCODE',
	  language:   'vn',
	  txt_billing_mobile:   '0901234567',
	  txt_billing_email:   'customer@example.com',
	  txt_billing_fullname:   'Nguyễn Văn Bình',
	  txt_inv_addr1:   '123 Fake Street',
	  txt_bill_city:   'Ho Chi Minh City',
	  txt_bill_country:   'VN',
	  txt_bill_state:   '',
	  txt_inv_mobile:   '0901234567',
	  txt_inv_email:   'customer@example.com',
	  txt_inv_customer:   'Nguyễn Văn Bình',
	  txt_inv_company:   'Acme Corp',
	  txt_inv_taxcode:   '123456789',
	  cbo_inv_type:   'I',
  };

  openPaymentPopup() {
    this.paymentService.processPayment(this.paymentRequest).subscribe(url => {
      window.open(url, 'Payment', 'width=800,height=600');
    });
  }

}
