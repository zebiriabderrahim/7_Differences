import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasDropdownMenuComponent } from './canvas-dropdown-menu.component';

describe('CanvasDropdownMenuComponent', () => {
  let component: CanvasDropdownMenuComponent;
  let fixture: ComponentFixture<CanvasDropdownMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasDropdownMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasDropdownMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
