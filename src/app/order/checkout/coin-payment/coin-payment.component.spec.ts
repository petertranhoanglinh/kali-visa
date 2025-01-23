import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinPaymentComponent } from './coin-payment.component';

describe('CoinPaymentComponent', () => {
  let component: CoinPaymentComponent;
  let fixture: ComponentFixture<CoinPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoinPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoinPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
