import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfosComponent } from './game-infos.component';

describe('GameInfosComponent', () => {
    let component: GameInfosComponent;
    let fixture: ComponentFixture<GameInfosComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [GameInfosComponent],
            providers: [],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameInfosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
