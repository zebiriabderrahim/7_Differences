// Needed to ignore what drawImage does in 'loadImage should properly load an image'
/* eslint-disable @typescript-eslint/no-empty-function */
// Needed to get contexts from test canvas in 'setAllData should get the imageData of the two contexts'
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Needed for the pre-calculated expectedIndexList in 'should convert 2D coordinates to pixel indexes'
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import {
    BACK_BUTTON,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    FLASH_WAIT_TIME,
    FORWARD_BUTTON,
    LEFT_BUTTON,
    MIDDLE_BUTTON,
    RIGHT_BUTTON,
} from '@app/constants/constants';
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
        gameAreaService['clickDisabled'] = true;
        expect(gameAreaService.detectLeftClick({ button: LEFT_BUTTON } as MouseEvent)).toBeFalse();
    });

    it('should not detect other button options as a left click', () => {
        expect(gameAreaService.detectLeftClick({ button: MIDDLE_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: RIGHT_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: BACK_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: FORWARD_BUTTON } as MouseEvent)).toBeFalse();
    });

    it('convert2DCoordToPixelIndex should convert 2D coordinates to pixel indexes', () => {
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

    it('setAllData should get the imageData of the two contexts', () => {
        const originalCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const modifiedCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const originalCanvasForeground: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const modifiedCanvasForeground: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        gameAreaService['originalContext'] = originalCanvas.getContext('2d')!;
        gameAreaService['modifiedContext'] = modifiedCanvas.getContext('2d')!;
        gameAreaService['originalContextFrontLayer'] = originalCanvasForeground.getContext('2d')!;
        gameAreaService['modifiedContextFrontLayer'] = modifiedCanvasForeground.getContext('2d')!;

        gameAreaService['originalContext'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['modifiedContext'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['originalContextFrontLayer'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['modifiedContextFrontLayer'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

        const originalGetImageDataSpy = spyOn(gameAreaService['originalContext'], 'getImageData');
        const modifiedGetImageDataSpy = spyOn(gameAreaService['modifiedContext'], 'getImageData');
        const originalFrontLayerGetImageDataSpy = spyOn(gameAreaService['originalContextFrontLayer'], 'getImageData');
        const modifiedFrontLayerGetImageDataSpy = spyOn(gameAreaService['modifiedContextFrontLayer'], 'getImageData');

        gameAreaService.setAllData();

        const expectedOriginal = gameAreaService['originalContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedModified = gameAreaService['modifiedContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedOriginalFrontLayer = gameAreaService['originalContextFrontLayer'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedModifiedFrontLayer = gameAreaService['modifiedContextFrontLayer'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        expect(originalGetImageDataSpy).toHaveBeenCalled();
        expect(modifiedGetImageDataSpy).toHaveBeenCalled();
        expect(originalFrontLayerGetImageDataSpy).toHaveBeenCalled();
        expect(modifiedFrontLayerGetImageDataSpy).toHaveBeenCalled();
        expect(gameAreaService['originalPixelData']).toEqual(expectedOriginal);
        expect(gameAreaService['modifiedPixelData']).toEqual(expectedModified);
        expect(gameAreaService['originalFrontPixelData']).toEqual(expectedOriginalFrontLayer);
        expect(gameAreaService['modifiedFrontPixelData']).toEqual(expectedModifiedFrontLayer);
    });

    it('loadImage should properly load an image', (done) => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
        const drawImageSpy = spyOn(context, 'drawImage').and.callFake(() => {});

        gameAreaService.loadImage(context, 'assets/img/RatCoon.png');
        setTimeout(() => {
            expect(drawImageSpy).toHaveBeenCalled();
            done();
        }, 350);
    });

    it('should properly remove the difference from the modified canvas', () => {
        const originalCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const modifiedCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        gameAreaService['originalContext'] = originalCanvas.getContext('2d')!;
        gameAreaService['modifiedContext'] = modifiedCanvas.getContext('2d')!;

        const putImageDataSpy = spyOn(gameAreaService['modifiedContext'], 'putImageData');
        const flashCorrectPixelsSpy = spyOn(gameAreaService, 'flashCorrectPixels').and.callFake(() => {});

        gameAreaService['originalContext'].fillStyle = 'blue';
        gameAreaService['originalContext'].fillRect(0, 0, 1, 1);

        gameAreaService['modifiedContext'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

        const squareDifference = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ];

        gameAreaService['originalPixelData'] = gameAreaService['originalContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['modifiedPixelData'] = gameAreaService['modifiedContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService.replaceDifference(squareDifference);

        expect(putImageDataSpy).toHaveBeenCalled();
        expect(flashCorrectPixelsSpy).toHaveBeenCalled();

        expect(gameAreaService['modifiedContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)).toEqual(
            gameAreaService['modifiedContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT),
        );
    });

    it('showError should display the word ERREUR and play error sound effect', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['originalContextFrontLayer'] = context;
        const initialImageData: ImageData = context.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        const playErrorSoundSpy = spyOn(gameAreaService, 'playErrorSound').and.callFake(() => {});
        const methodSpy = spyOn(context, 'fillText');
        gameAreaService['mousePosition'] = { x: 100, y: 150 };
        gameAreaService.showError(true);
        expect(context.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)).toEqual(initialImageData);
        expect(methodSpy).toHaveBeenCalled();
        expect(playErrorSoundSpy).toHaveBeenCalled();
    });

    it('flashCorrectPixels should flash the difference pixels on both canvas', (done) => {
        const currentDifference = [{ x: 100, y: 150 }];
        const originalCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['originalContextFrontLayer'] = originalCanvasFrontLayer.getContext('2d')!;
        const modifiedCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['modifiedContextFrontLayer'] = modifiedCanvasFrontLayer.getContext('2d')!;
        const ogPutImageDataSpy = spyOn(gameAreaService['originalContextFrontLayer'], 'putImageData');
        const mdPutImageDataSpy = spyOn(gameAreaService['modifiedContextFrontLayer'], 'putImageData');
        const ogClearRect = spyOn(gameAreaService['originalContextFrontLayer'], 'clearRect');
        const mdClearRect = spyOn(gameAreaService['originalContextFrontLayer'], 'clearRect');
        const ogInitialImageData = (gameAreaService['originalFrontPixelData'] = gameAreaService['originalContextFrontLayer'].createImageData(
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
        ));
        const mdInitialImageData = (gameAreaService['modifiedFrontPixelData'] = gameAreaService['modifiedContextFrontLayer'].createImageData(
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
        ));

        gameAreaService.flashCorrectPixels(currentDifference);

        setTimeout(() => {
            expect(ogPutImageDataSpy).toHaveBeenCalled();
            expect(mdPutImageDataSpy).toHaveBeenCalled();
            expect(ogClearRect).toHaveBeenCalled();
            expect(mdClearRect).toHaveBeenCalled();
            expect(gameAreaService['originalFrontPixelData']).toEqual(ogInitialImageData);
            expect(gameAreaService['modifiedFrontPixelData']).toEqual(mdInitialImageData);
            done();
        }, FLASH_WAIT_TIME);
    });
});
