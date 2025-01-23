// order-tracking.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface OrderDetails {
  orderId: string;
  orderDate: string;
  status: string;
  shippingAddress: string;
  currentStep: number;
}

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit {
  trackingForm: FormGroup;
  orderDetails: OrderDetails | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.trackingForm = this.fb.group({
      orderId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  trackOrder() {
    if (this.trackingForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Simulate API call
      setTimeout(() => {
        this.orderDetails = {
          orderId: '#MOL123456',
          orderDate: '18/11/2024',
          status: 'Processing',
          shippingAddress: '123 ABC Street, XYZ District, HCMC',
          currentStep: 2
        };
        this.isLoading = false;
      }, 1000);
    }
  }

  isStepActive(step: number): boolean {
    return this.orderDetails ? step <= this.orderDetails.currentStep : false;
  }

  resetForm() {
    this.trackingForm.reset();
    this.orderDetails = null;
    this.errorMessage = '';
  }
}
