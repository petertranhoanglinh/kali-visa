import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCatelogyComponent } from './register-catelogy.component';

describe('RegisterCatelogyComponent', () => {
  let component: RegisterCatelogyComponent;
  let fixture: ComponentFixture<RegisterCatelogyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterCatelogyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterCatelogyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
