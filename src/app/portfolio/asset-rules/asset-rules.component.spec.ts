import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetRulesComponent } from './asset-rules.component';

describe('AssetRulesComponent', () => {
  let component: AssetRulesComponent;
  let fixture: ComponentFixture<AssetRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetRulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
