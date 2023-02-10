/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BACK_BUTTON, CANVAS_HEIGHT, CANVAS_WIDTH, FORWARD_BUTTON, LEFT_BUTTON, MIDDLE_BUTTON, RIGHT_BUTTON } from '@app/constants/constants';
import { Coordinate } from '@common/coordinate';
import { GameAreaService } from './game-area.service';

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

    it('should not detect left click if clicking is disabled', () => {
        gameAreaService.clickDisabled = true;
        expect(gameAreaService.detectLeftClick({ button: LEFT_BUTTON } as MouseEvent)).toBeFalse();
    });

    it('should not detect other button options as a left click', () => {
        expect(gameAreaService.detectLeftClick({ button: MIDDLE_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: RIGHT_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: BACK_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: FORWARD_BUTTON } as MouseEvent)).toBeFalse();
    });

    it('should convert 2D coordinates to pixel indexes', () => {
        const differenceCoord: Coordinate[] = [
            { x: 12, y: 15 },
            { x: 0, y: 0 },
            { x: 20, y: 100 },
            { x: 30, y: 0 },
        ];
        const expectedIndexList: number[] = [38448, 0, 256080, 120];
        const resultingIndexList: number[] = gameAreaService.convert2DCoordToPixelIndex(differenceCoord);
        expect(resultingIndexList).toEqual(expectedIndexList);
    });

    it('should get the imagesData of the two contexts when setImageData is called', () => {
        const originalCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const modifiedCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const originalCanvasForeground: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const modifiedCanvasForeground: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        gameAreaService.originalContext = originalCanvas.getContext('2d')!;
        gameAreaService.modifiedContext = modifiedCanvas.getContext('2d')!;
        gameAreaService.originalContextFrontLayer = originalCanvasForeground.getContext('2d')!;
        gameAreaService.modifiedContextFrontLayer = modifiedCanvasForeground.getContext('2d')!;

        gameAreaService.originalContext.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService.modifiedContext.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService.originalContextFrontLayer.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService.modifiedContextFrontLayer.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

        const originalGetImageDataSpy = spyOn(gameAreaService.originalContext, 'getImageData');
        const modifiedGetImageDataSpy = spyOn(gameAreaService.modifiedContext, 'getImageData');
        const originalFrontLayerGetImageDataSpy = spyOn(gameAreaService.originalContextFrontLayer, 'getImageData');
        const modifiedFrontLayerGetImageDataSpy = spyOn(gameAreaService.modifiedContextFrontLayer, 'getImageData');

        gameAreaService.setAllData();

        expect(originalGetImageDataSpy).toHaveBeenCalled();
        expect(modifiedGetImageDataSpy).toHaveBeenCalled();
        expect(originalFrontLayerGetImageDataSpy).toHaveBeenCalled();
        expect(modifiedFrontLayerGetImageDataSpy).toHaveBeenCalled();

        const expectedOriginal = gameAreaService.originalContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedModified = gameAreaService.modifiedContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedOriginalFrontLayer = gameAreaService.originalContextFrontLayer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedModifiedFrontLayer = gameAreaService.modifiedContextFrontLayer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        expect(gameAreaService.originalPixelData).toEqual(expectedOriginal);
        expect(gameAreaService.modifiedPixelData).toEqual(expectedModified);
        expect(gameAreaService.originalFrontPixelData).toEqual(expectedOriginalFrontLayer);
        expect(gameAreaService.modifiedFrontPixelData).toEqual(expectedModifiedFrontLayer);
    });
});
