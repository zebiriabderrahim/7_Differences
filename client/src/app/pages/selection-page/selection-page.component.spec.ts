import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
  let component: SelectionPageComponent;
  let fixture: ComponentFixture<SelectionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
