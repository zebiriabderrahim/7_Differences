import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayButtonsComponent } from './replay-buttons.component';

describe('ReplayButtonsComponent', () => {
  let component: ReplayButtonsComponent;
  let fixture: ComponentFixture<ReplayButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplayButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplayButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
