import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPriceComponent } from './test-price.component';

describe('TestPriceComponent', () => {
  let component: TestPriceComponent;
  let fixture: ComponentFixture<TestPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestPriceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
