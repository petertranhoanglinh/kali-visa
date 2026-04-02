import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  @Input() selectedPlan: any;
  @Output() cancel = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  processPayment() {
    alert('Thanh toán thành công gói ' + this.selectedPlan?.name + '! Cảm ơn bạn.');
    this.cancel.emit(); // Return to pricing/dashboard
  }

}
