import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SoloGameViewComponent } from './solo-game-view.component';

describe('SoloGameViewComponent', () => {
    let component: SoloGameViewComponent;
    let fixture: ComponentFixture<SoloGameViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [SoloGameViewComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloGameViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
