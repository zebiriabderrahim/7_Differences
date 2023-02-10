import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfosComponent } from './game-infos.component';

describe('GameInfosComponent', () => {
    let component: GameInfosComponent;
    let fixture: ComponentFixture<GameInfosComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [],
            providers: [],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameInfosComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should have input properties set correctly', () => {});
});
