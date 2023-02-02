import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfosComponent } from './game-infos.component';

describe('GameInfosComponent', () => {
    let component: GameInfosComponent;
    let fixture: ComponentFixture<GameInfosComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameInfosComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameInfosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /*
    it('should have game input', () => {
        expect(component.game).toBeUndefined();
    });

    it('should have mode input', () => {
        if (component?.mode !== undefined && component?.mode !== null) {
            component.mode = 'soloMode';
            expect(component.mode).toEqual('soloMode');
        } else {
            fail('mode is undefined');
        }
    });

    it('should have penaltyTime input', () => {
        component.penaltyTime = 1;
        expect(component.penaltyTime).toEqual(1);
    });

    it('should have bonusTime input', () => {
        component.bonusTime = 0;
        expect(component.bonusTime).toEqual(0);
    });
    */
});
