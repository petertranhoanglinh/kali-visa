import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {

  @Output() planSelected = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  selectPlan(planName: string, price: number) {
    this.planSelected.emit({ name: planName, price: price });
  }

}
