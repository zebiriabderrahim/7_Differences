import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingHostToDecideComponent } from './waiting-host-to-decide.component';

describe('WaitingHostToDecideComponent', () => {
  let component: WaitingHostToDecideComponent;
  let fixture: ComponentFixture<WaitingHostToDecideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaitingHostToDecideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitingHostToDecideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
