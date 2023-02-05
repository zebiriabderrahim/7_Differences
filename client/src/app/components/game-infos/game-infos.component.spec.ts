import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game-interfaces';
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

        const game: Game = {
            id: 0,
            name: 'test',
            difficultyLevel: true,
            original: 'test',
            modified: '',
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 0,
            thumbnail: '',
            hintList: [''],
        };
        component.game = game;
        component.mode = 'solo';
        component.penaltyTime = 0;
        component.bonusTime = 0;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have input properties set correctly', () => {
        expect(component.game.id).toEqual(0);
        expect(component.mode).toEqual('solo');
        expect(component.penaltyTime).toEqual(0);
        expect(component.bonusTime).toEqual(0);
    });
});
