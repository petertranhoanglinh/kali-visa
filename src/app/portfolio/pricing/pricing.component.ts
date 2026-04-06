import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {

  @Output() planSelected = new EventEmitter<any>();

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  selectPlan(planName: string, price: number) {
    const plan = { name: planName, price: price };
    this.planSelected.emit(plan);
    // Navigate to checkout and pass the plan
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    this.router.navigate(['/checkout']);
  }

}
