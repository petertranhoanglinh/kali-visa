import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatTingComponent } from './chat-ting.component';

describe('ChatTingComponent', () => {
  let component: ChatTingComponent;
  let fixture: ComponentFixture<ChatTingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatTingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatTingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
