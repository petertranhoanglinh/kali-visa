import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoesProductListComponent } from './shoes-product-list.component';

describe('ShoesProductListComponent', () => {
  let component: ShoesProductListComponent;
  let fixture: ComponentFixture<ShoesProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoesProductListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoesProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
