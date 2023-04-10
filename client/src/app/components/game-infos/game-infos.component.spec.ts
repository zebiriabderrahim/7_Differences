import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { Coordinate } from '@common/coordinate';
import { GameInfosComponent } from './game-infos.component';
// import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';

describe('GameInfosComponent', () => {
    let component: GameInfosComponent;
    let fixture: ComponentFixture<GameInfosComponent>;
    // let gameAreaService: GameAreaService;
    // let classicSystemService: ClassicSystemService;
    let hintServiceSpy: jasmine.SpyObj<HintService>;
    let nAvailableHintsMock: number;
    let differencesMock: Coordinate[][];

    beforeEach(async () => {
        differencesMock = [
            [
                { x: 0, y: 0 },
                { x: 1, y: 2 },
            ],
            [
                { x: 56, y: 78 },
                { x: 57, y: 12 },
            ],
        ];
        nAvailableHintsMock = 3;
        hintServiceSpy = jasmine.createSpyObj(
            'HintService',
            [
                'requestHint',
                'generateRandomNumber',
                'generateAdjustedHintSquare',
                'generateLastHintDifferences',
                'getHintQuadrant',
                'generateHintSquare',
            ],
            {
                nAvailableHints: nAvailableHintsMock,
                differences: differencesMock,
            },
        );
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

    it('should return the number of available hints', () => {
        expect(component.nHints).toEqual(3);
        expect(hintServiceSpy.nAvailableHints).toEqual(3);
    });

    // it('should call hintService.requestHint', () => {
    //     // spyOn(gameAreaService, 'flashCorrectPixels').and.callThrough();
    //     // spyOn(classicSystemService, 'requestHint').and.callThrough();
    //     component.requestHint();
    //     expect(hintServiceSpy.requestHint).toHaveBeenCalled();
    // });
});
