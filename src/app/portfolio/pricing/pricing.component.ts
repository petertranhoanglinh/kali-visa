import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { CommonUtils } from 'src/app/common/util/common-utils';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {

  @Output() planSelected = new EventEmitter<any>();
  isPremium: boolean = false;
  userTier: string = 'BASIC';

  constructor(private router: Router) { }

  ngOnInit(): void {
    const user = AuthDetail.getLoginedInfo();
    this.userTier = user?.tier || 'BASIC';
    this.isPremium = CommonUtils.checkPremiumStatus(user);
  }

  selectPlan(planName: string, price: number) {
    const plan = { name: planName, price: price };
    this.planSelected.emit(plan);
    // Navigate to checkout and pass the plan
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    this.router.navigate(['/checkout']);
  }

}
