import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRewiewComponent } from './product-rewiew.component';

describe('ProductRewiewComponent', () => {
  let component: ProductRewiewComponent;
  let fixture: ComponentFixture<ProductRewiewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductRewiewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductRewiewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
