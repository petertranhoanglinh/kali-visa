import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingTradeComponent } from './setting-trade.component';

describe('SettingTradeComponent', () => {
  let component: SettingTradeComponent;
  let fixture: ComponentFixture<SettingTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingTradeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
