// needed to spy on private methods
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { LAST_HINT_NUMBER, SECOND_TO_LAST_HINT_NUMBER } from '@app/constants/hint';
import { HintProximity } from '@app/enum/hint-proximity';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { Coordinate } from '@common/coordinate';
import { HintService } from './hint.service';

describe('HintService', () => {
    let service: HintService;
    let gameManagerSpy: jasmine.SpyObj<GameManagerService>;
    let gameAreaServiceSpy: jasmine.SpyObj<GameAreaService>;
    let differenceServiceSpy: jasmine.SpyObj<DifferenceService>;
    const mockDifference: Coordinate[] = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
    ];

    beforeEach(() => {
        gameManagerSpy = jasmine.createSpyObj('GameManagerService', ['requestHint'], {
            differences: [mockDifference],
        });
        gameAreaServiceSpy = jasmine.createSpyObj('GameAreaService', ['flashPixels']);
        differenceServiceSpy = jasmine.createSpyObj('DifferenceService', ['enlargeDifferences']);
        TestBed.configureTestingModule({
            providers: [
                { provide: GameManagerService, useValue: gameManagerSpy },
                { provide: GameAreaService, useValue: gameAreaServiceSpy },
                { provide: DifferenceService, useValue: differenceServiceSpy },
            ],
        });
        service = TestBed.inject(HintService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('differences should return the differences from the gameManager', () => {
        expect(service['differences']).toEqual(gameManagerSpy.differences);
    });

    it('deactivateThirdHint should deactivate the third hint', () => {
        service.isThirdHintActive = true;
        service.deactivateThirdHint();
        expect(service.isThirdHintActive).toBeFalsy();
    });

    it('requestHint should call gameManager.requestHint', () => {
        service.requestHint();
        expect(gameManagerSpy.requestHint).toHaveBeenCalled();
    });

    it('requestHint should call generateLastDifference if its the lastDifference', () => {
        service.nAvailableHints = LAST_HINT_NUMBER;
        differenceServiceSpy.enlargeDifferences.and.returnValue(mockDifference);
        service.requestHint();
        expect(gameManagerSpy.requestHint).toHaveBeenCalled();
    });

    it('requestHint should call generateLastDifference with replayDifference if its the lastDifference if provided', () => {
        const mockReplayDifference: Coordinate[] = [
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        differenceServiceSpy.enlargeDifferences.and.returnValue(mockDifference);
        service.nAvailableHints = LAST_HINT_NUMBER;
        service.requestHint(mockReplayDifference);
        expect(gameManagerSpy.requestHint).toHaveBeenCalled();
    });

    it('requestHint should call generateHintQuadrant twice if its the second to last hint', () => {
        const generateHintQuadrantSpy = spyOn<any>(service, 'generateHintQuadrant').and.callThrough();
        service.nAvailableHints = SECOND_TO_LAST_HINT_NUMBER;
        service.requestHint();
        expect(generateHintQuadrantSpy).toHaveBeenCalledTimes(2);
    });

    it('checkThirdHintProximity should call switchProximity ', () => {
        const switchProximitySpy = spyOn(service, 'switchProximity').and.callThrough();
        service.checkThirdHintProximity({ x: 0, y: 0 });
        expect(switchProximitySpy).toHaveBeenCalled();
    });

    it('switchProximity should change if its the same', () => {
        const mockProximity: HintProximity = HintProximity.OnIt;
        service.thirdHintProximity = mockProximity;
        service.switchProximity(mockProximity);
        expect(service.thirdHintProximity).toEqual(mockProximity);
    });

    it('switchProximity should change if its the same', () => {
        const mockProximity: HintProximity = HintProximity.OnIt;
        service.thirdHintProximity = mockProximity;
        service.switchProximity(HintProximity.TooFar);
        expect(service.thirdHintProximity).not.toEqual(mockProximity);
    });
});
