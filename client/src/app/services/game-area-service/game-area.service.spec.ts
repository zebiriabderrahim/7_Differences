import { TestBed } from '@angular/core/testing';
// import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GameAreaService } from './game-area.service';
// import { Vec2 } from '@app/interfaces/vec2';
import { LEFT_BUTTON, MIDDLE_BUTTON, RIGHT_BUTTON, BACK_BUTTON, FORWARD_BUTTON } from '@app/constants/constants';

describe('GameAreaService', () => {
    let gameAreaService: GameAreaService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        gameAreaService = TestBed.inject(GameAreaService);
    });

    it('should be created', () => {
        expect(gameAreaService).toBeTruthy();
    });

    it('should detect left click on screen and call saveCoord', () => {
        const saveCoordSpy = spyOn(gameAreaService, 'saveCoord');
        expect(gameAreaService.detectLeftClick({ button: LEFT_BUTTON } as MouseEvent)).toBeTruthy();
        expect(saveCoordSpy).toHaveBeenCalled();
    });

    it('should not detect other button options as a left click', () => {
        expect(gameAreaService.detectLeftClick({ button: MIDDLE_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: RIGHT_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: BACK_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: FORWARD_BUTTON } as MouseEvent)).toBeFalse();
    });

    it('should not detect left click if clicking is disabled', () => {
        gameAreaService.clickDisabled = true;
        expect(gameAreaService.detectLeftClick({ button: LEFT_BUTTON } as MouseEvent)).toBeFalse();
    });
});
