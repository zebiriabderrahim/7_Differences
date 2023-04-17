import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { GameInfosComponent } from './game-infos.component';

describe('GameInfosComponent', () => {
    let component: GameInfosComponent;
    let fixture: ComponentFixture<GameInfosComponent>;
    let gameManagerSpy: jasmine.SpyObj<GameManagerService>;
    let hintServiceSpy: jasmine.SpyObj<HintService>;

    beforeEach(async () => {
        hintServiceSpy = jasmine.createSpyObj('HintService', ['requestHint'], {
            nAvailableHints: 3,
        });
        gameManagerSpy = jasmine.createSpyObj('GameManagerService', [], {
            gameConstants: {
                countdownTime: 10,
                penaltyTime: 5,
                bonusTime: 5,
            },
        });

        await TestBed.configureTestingModule({
            imports: [],
            declarations: [],
            providers: [
                {
                    provide: HintService,
                    useValue: hintServiceSpy,
                },
                {
                    provide: GameManagerService,
                    useValue: gameManagerSpy,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameInfosComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the number of available hints', () => {
        expect(component.nHints).toEqual(hintServiceSpy.nAvailableHints);
    });

    it('requestHint should call hintService.requestHint', () => {
        component.requestHint();
        expect(hintServiceSpy.requestHint).toHaveBeenCalled();
    });

    it('gameConstants should return the gameManager.gameConstants', () => {
        expect(component.gameConstants).toEqual(gameManagerSpy.gameConstants);
    });
});
