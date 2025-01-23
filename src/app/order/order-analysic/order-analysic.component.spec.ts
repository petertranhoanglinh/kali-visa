import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAnalysicComponent } from './order-analysic.component';

describe('OrderAnalysicComponent', () => {
  let component: OrderAnalysicComponent;
  let fixture: ComponentFixture<OrderAnalysicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderAnalysicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderAnalysicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
