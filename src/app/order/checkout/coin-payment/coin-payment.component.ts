import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';

@Component({
  selector: 'app-coin-payment',
  templateUrl: './coin-payment.component.html',
  styleUrls: ['./coin-payment.component.css']
})
export class CoinPaymentComponent implements OnInit {


  @Input() isSubmit: boolean = false;  // Sử dụng để nhận giá trị từ component cha

  @Input() ordNoTmp: string = '';
  @Input() params: any = '';






  paymentForm: FormGroup;
  form: FormGroup = {} as FormGroup;


  constructor(private fb: FormBuilder) {

    this.paymentForm = this.fb.group({
      cmd: ['_pay_simple'],
      reset: ['1'],
      merchant: ['1d529a701cd3a3e37284f03c12368aa8'],
      amountf: 0,
      currency: ['USDT'],
      item_name: ['WEBIXX'],
      item_desc: ['ORDER'],
      want_shipping: ['0'],
      // ipn_url : ['https://v365.wowcns.net/api/ipn-handler'],
      success_url: [],
      cancel_url: [],
      first_name: [''],
      last_name: [''],
      email: [''],
      phone: [''],
      invoice: [''],
      custom: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isSubmit'] && changes['isSubmit'].currentValue) {
      // Nếu `isSubmit` là `true`, gọi hàm submit form
      if (this.isSubmit) {
        this.submitForm();
        this.isSubmit = false;
      }


    }
  }

  ngOnInit(): void {



  }


  submitForm() {
    const domain = window.location.origin;
    this.paymentForm.get('success_url')?.setValue(
      `${domain}/shopping-mall/checkout/payment-coin-success?ordNoTmp=${this.params.ordNoTmp}`
    );
    this.paymentForm.get('cancel_url')?.setValue(
      `${domain}/shopping-mall/checkout/payment-coin-cancel?ordNoTmp=${this.params.ordNoTmp}`
    );
    this.paymentForm.get('invoice')?.setValue(
      "21222"
    );
    this.paymentForm.get('custom')?.setValue(
      String(AuthDetail.getLoginedInfo()?.id)
    );
    this.paymentForm.get('amountf')?.setValue(
      this.params.totalAmount
    );
    this.paymentForm.get('first_name')?.setValue(
      this.params.orderDeli.firstName
    );
    this.paymentForm.get('last_name')?.setValue(
      this.params.orderDeli.lastName
    );
    this.paymentForm.get('email')?.setValue(
      this.params.orderDeli.email
    );
    const form = this.paymentForm;
    // Create a form element
    const formElement: HTMLFormElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.action = 'https://www.coinpayments.net/index.php';
    // Set the target to a named window
    const popupWindowName = 'paymentPopup';
    // Add fields from Reactive Form to form element
    Object.keys(form.controls).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = form.controls[key].value;
      formElement.appendChild(input);
    });
    // Open a new popup window and submit the form to that window
    const popupWindow = window.open('', popupWindowName, 'width=600,height=900');
    if (popupWindow) {
      formElement.target = popupWindowName;
      document.body.appendChild(formElement);
      formElement.submit();

      const checkPopupClosed = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(checkPopupClosed);
        }
      }, 500); // Kiểm tra
    } else {
      // If popup blocker is enabled or the window could not be opened
      alert('Please allow popups for this website to proceed with the payment.');
    }
  }



}
