import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasTopButtonsComponent } from './canvas-top-buttons.component';

describe('CanvasTopButtonsComponent', () => {
  let component: CanvasTopButtonsComponent;
  let fixture: ComponentFixture<CanvasTopButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasTopButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasTopButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
