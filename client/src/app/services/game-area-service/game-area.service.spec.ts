// Needed for lines for tests
/* eslint-disable max-lines */
// to spyOn private function
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    CHEAT_MODE_WAIT_TIME,
    FLASH_WAIT_TIME,
    FORWARD_BUTTON,
    LEFT_BUTTON,
    MIDDLE_BUTTON,
    ONE_SECOND,
    RED_FLASH_TIME,
    RIGHT_BUTTON,
    YELLOW_FLASH_TIME
} from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { Coordinate } from '@common/coordinate';
import { GameAreaService } from './game-area.service';

describe('GameAreaService', () => {
    let gameAreaService: GameAreaService;
    let timerCallback: jasmine.Spy<jasmine.Func>;
    let intervalCallback: jasmine.Spy<jasmine.Func>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        gameAreaService = TestBed.inject(GameAreaService);
        timerCallback = jasmine.createSpy('timerCallback');
        intervalCallback = jasmine.createSpy('intervalCallback');
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(gameAreaService).toBeTruthy();
    });

    it('should detect left click on screen and call saveCoord', () => {
        const saveCoordSpy = spyOn(gameAreaService, 'saveCoord');
        expect(gameAreaService.detectLeftClick({ button: LEFT_BUTTON } as MouseEvent)).toBeTruthy();
        expect(saveCoordSpy).toHaveBeenCalled();
    });

    it('saveCoord should properly save mouse position', () => {
        const expectedMousePosition = { x: 15, y: 18 };
        const clickEvent: MouseEvent = { offsetX: 15, offsetY: 18 } as MouseEvent;
        gameAreaService.saveCoord(clickEvent);
        expect(gameAreaService['mousePosition']).toEqual(expectedMousePosition);
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
        const resultingIndexList: number[] = gameAreaService['convert2DCoordToPixelIndex'](differenceCoord);
        expect(resultingIndexList).toEqual(expectedIndexList);
    });

    it('setAllData should get the imageData of the two contexts', () => {
        const originalCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const modifiedCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const originalCanvasForeground: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const modifiedCanvasForeground: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['originalContext'] = originalCanvas.getContext('2d')!;
        gameAreaService['modifiedContext'] = modifiedCanvas.getContext('2d')!;
        gameAreaService['originalContextFrontLayer'] = originalCanvasForeground.getContext('2d')!;
        gameAreaService['modifiedContextFrontLayer'] = modifiedCanvasForeground.getContext('2d')!;
        gameAreaService['originalContext'].createImageData(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['modifiedContext'].createImageData(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['originalContextFrontLayer'].createImageData(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['modifiedContextFrontLayer'].createImageData(IMG_WIDTH, IMG_HEIGHT);
        const originalGetImageDataSpy = spyOn(gameAreaService['originalContext'], 'getImageData');
        const modifiedGetImageDataSpy = spyOn(gameAreaService['modifiedContext'], 'getImageData');
        const originalFrontLayerGetImageDataSpy = spyOn(gameAreaService['originalContextFrontLayer'], 'getImageData');
        const modifiedFrontLayerGetImageDataSpy = spyOn(gameAreaService['modifiedContextFrontLayer'], 'getImageData');
        gameAreaService.setAllData();
        const expectedOriginal = gameAreaService['originalContext'].getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const expectedModified = gameAreaService['modifiedContext'].getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const expectedOriginalFrontLayer = gameAreaService['originalContextFrontLayer'].getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const expectedModifiedFrontLayer = gameAreaService['modifiedContextFrontLayer'].getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        expect(originalGetImageDataSpy).toHaveBeenCalled();
        expect(modifiedGetImageDataSpy).toHaveBeenCalled();
        expect(originalFrontLayerGetImageDataSpy).toHaveBeenCalled();
        expect(modifiedFrontLayerGetImageDataSpy).toHaveBeenCalled();
        expect(gameAreaService['originalPixelData']).toEqual(expectedOriginal);
        expect(gameAreaService['modifiedPixelData']).toEqual(expectedModified);
        expect(gameAreaService['originalFrontPixelData']).toEqual(expectedOriginalFrontLayer);
        expect(gameAreaService['modifiedFrontPixelData']).toEqual(expectedModifiedFrontLayer);
    });

    it('should correctly eliminate disparities from the altered canvas', () => {
        const originalCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const modifiedCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['originalContext'] = originalCanvas.getContext('2d')!;
        gameAreaService['modifiedContext'] = modifiedCanvas.getContext('2d')!;
        const putImageDataSpy = spyOn(gameAreaService['modifiedContext'], 'putImageData');
        const flashCorrectPixelsSpy = spyOn(gameAreaService, 'flashCorrectPixels').and.callFake(() => {});
        gameAreaService['originalContext'].fillRect(0, 0, 3, 1);
        gameAreaService['modifiedContext'].createImageData(IMG_WIDTH, IMG_HEIGHT);
        const rectangleDifference = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
        ];
        gameAreaService['originalPixelData'] = gameAreaService['originalContext'].getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['modifiedPixelData'] = gameAreaService['modifiedContext'].getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        gameAreaService.replaceDifference(rectangleDifference);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(flashCorrectPixelsSpy).toHaveBeenCalled();
        expect(gameAreaService['modifiedContext'].getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT)).toEqual(
            gameAreaService['modifiedContext'].getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT),
        );
    });

    it('showError should display an error on the left canvas', async () => {
        jasmine.clock().install();
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['originalContextFrontLayer'] = context;
        const initialImageData: ImageData = context.createImageData(IMG_WIDTH, IMG_HEIGHT);
        const methodSpy = spyOn(context, 'fillText');
        gameAreaService['mousePosition'] = { x: 100, y: 150 };
        setTimeout(() => {
            timerCallback();
        }, ONE_SECOND);
        gameAreaService.showError(true);
        expect(timerCallback).not.toHaveBeenCalled();
        jasmine.clock().tick(ONE_SECOND + 1);
        expect(timerCallback).toHaveBeenCalled();
        expect(context.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT)).toEqual(initialImageData);
        expect(methodSpy).toHaveBeenCalled();
    });

    it('showError should display an error on the right canvas', async () => {
        jasmine.clock().install();
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['modifiedContextFrontLayer'] = context;
        const initialImageData: ImageData = context.createImageData(IMG_WIDTH, IMG_HEIGHT);
        const methodSpy = spyOn(context, 'fillText');
        gameAreaService['mousePosition'] = { x: 100, y: 150 };
        setTimeout(() => {
            timerCallback();
        }, ONE_SECOND);
        gameAreaService.showError(false);
        expect(timerCallback).not.toHaveBeenCalled();
        jasmine.clock().tick(ONE_SECOND + 1);
        expect(timerCallback).toHaveBeenCalled();
        expect(context.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT)).toEqual(initialImageData);
        expect(methodSpy).toHaveBeenCalled();
    });

    it('flashCorrectPixels should get image data indexes and call flashPixels', () => {
        spyOn(gameAreaService, 'putImageDataToContexts');
        const differenceCoord: Coordinate[] = [
            { x: 12, y: 15 },
            { x: 0, y: 0 },
            { x: 20, y: 100 },
            { x: 30, y: 0 },
        ];
        const expectedIndexList: number[] = [38448, 0, 256080, 120];
        const convert2DCoordToPixelIndexSpy = spyOn<any>(gameAreaService, 'convert2DCoordToPixelIndex').and.callThrough();
        const flashPixelsSpy = spyOn(gameAreaService, 'flashPixels').and.callFake(() => {});
        gameAreaService.flashCorrectPixels(differenceCoord);
        expect(convert2DCoordToPixelIndexSpy).toHaveBeenCalledWith(differenceCoord);
        expect(flashPixelsSpy).toHaveBeenCalledWith(expectedIndexList);
    });

    it('toggleCheatMode should enable cheat mode and start flashing red pixels', () => {
        jasmine.clock().install();
        spyOn(window, 'setInterval').and.callThrough();
        spyOn(window, 'setTimeout').and.callThrough();
        gameAreaService['originalFrontPixelData'] = new ImageData(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['modifiedFrontPixelData'] = new ImageData(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['toggleCheatMode']([
            { x: 1, y: 2 },
            { x: 3, y: 4 },
        ]);
        expect(gameAreaService['isCheatMode']).toBeTrue();
        expect(window.setInterval).toHaveBeenCalledOnceWith(jasmine.any(Function), CHEAT_MODE_WAIT_TIME);
        expect(gameAreaService['cheatModeInterval']).toBeDefined();
        jasmine.clock().tick(CHEAT_MODE_WAIT_TIME + 1);
        expect(window.setTimeout).toHaveBeenCalledOnceWith(jasmine.any(Function), RED_FLASH_TIME);
        jasmine.clock().tick(RED_FLASH_TIME + 1);
        expect(window.setTimeout).toHaveBeenCalledTimes(1);
    });

    it('toggleCheatMode should disable cheat mode and stop flashing red pixels', () => {
        spyOn(window, 'clearInterval').and.callThrough();
        spyOn(window, 'setTimeout').and.callThrough();
        gameAreaService['isCheatMode'] = true;
        gameAreaService['cheatModeInterval'] = setInterval(() => {}, 1000) as unknown as number;
        gameAreaService['toggleCheatMode']([
            { x: 1, y: 2 },
            { x: 3, y: 4 },
        ]);
        expect(gameAreaService['isCheatMode']).toBeFalse();
        expect(window.clearInterval).toHaveBeenCalledOnceWith(gameAreaService['cheatModeInterval']);
        gameAreaService.clearFlashing();
        expect(window.setTimeout).not.toHaveBeenCalled();
    });

    it('flashPixels should flash the difference pixels on both canvas', async () => {
        jasmine.clock().install();
        const currentDifference = [
            { x: 100, y: 150 },
            { x: 100, y: 200 },
            { x: 126, y: 154 },
        ];
        const originalCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['originalContextFrontLayer'] = originalCanvasFrontLayer.getContext('2d')!;
        const modifiedCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['modifiedContextFrontLayer'] = modifiedCanvasFrontLayer.getContext('2d')!;
        const putImageDataToContextsSpy = spyOn(gameAreaService, 'putImageDataToContexts').and.callFake(() => {});
        const clearFlashingSpy = spyOn(gameAreaService, 'clearFlashing').and.callFake(() => {});
        const ogInitialImageData = (gameAreaService['originalFrontPixelData'] = gameAreaService['originalContextFrontLayer'].createImageData(
            IMG_WIDTH,
            IMG_HEIGHT,
        ));
        const mdInitialImageData = (gameAreaService['modifiedFrontPixelData'] = gameAreaService['modifiedContextFrontLayer'].createImageData(
            IMG_WIDTH,
            IMG_HEIGHT,
        ));
        gameAreaService.flashCorrectPixels(currentDifference);
        setInterval(() => {
            intervalCallback();
            setTimeout(() => {
                timerCallback();
                expect(putImageDataToContextsSpy).toHaveBeenCalled();
                expect(clearFlashingSpy).toHaveBeenCalled();
                expect(gameAreaService['originalFrontPixelData']).toEqual(ogInitialImageData);
                expect(gameAreaService['modifiedFrontPixelData']).toEqual(mdInitialImageData);
            }, FLASH_WAIT_TIME);
        }, YELLOW_FLASH_TIME);
        expect(timerCallback).not.toHaveBeenCalled();
        expect(intervalCallback).not.toHaveBeenCalled();
        jasmine.clock().tick(FLASH_WAIT_TIME + 1);
        jasmine.clock().tick(YELLOW_FLASH_TIME + 1);
        expect(timerCallback).toHaveBeenCalled();
        expect(intervalCallback).toHaveBeenCalled();
    });

    it('putImageDataToContexts should paint data on the front contexts', () => {
        const originalCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['originalContextFrontLayer'] = originalCanvasFrontLayer.getContext('2d')!;
        const modifiedCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['modifiedContextFrontLayer'] = modifiedCanvasFrontLayer.getContext('2d')!;
        const ogFrontContextPutImageDataSpy = spyOn(gameAreaService['originalContextFrontLayer'], 'putImageData').and.callFake(() => {});
        const mdFrontContextPutImageDataSpy = spyOn(gameAreaService['modifiedContextFrontLayer'], 'putImageData').and.callFake(() => {});
        gameAreaService.putImageDataToContexts();
        expect(ogFrontContextPutImageDataSpy).toHaveBeenCalled();
        expect(mdFrontContextPutImageDataSpy).toHaveBeenCalled();
    });

    it('clearFlashing should reset pixels on the front contexts and allow user to press', () => {
        const originalCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['originalContextFrontLayer'] = originalCanvasFrontLayer.getContext('2d')!;
        const modifiedCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        gameAreaService['modifiedContextFrontLayer'] = modifiedCanvasFrontLayer.getContext('2d')!;
        const ogFrontContextClearRectSpy = spyOn(gameAreaService['originalContextFrontLayer'], 'clearRect').and.callFake(() => {});
        const mdFrontContextClearRectSpy = spyOn(gameAreaService['modifiedContextFrontLayer'], 'clearRect').and.callFake(() => {});
        gameAreaService.clearFlashing();
        expect(ogFrontContextClearRectSpy).toHaveBeenCalled();
        expect(mdFrontContextClearRectSpy).toHaveBeenCalled();
        expect(gameAreaService['clickDisabled']).toEqual(false);
    });

    it('getOgContext should return originalContext', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['originalContext'] = context;
        const returnedContext = gameAreaService.getOgContext();
        expect(returnedContext).toEqual(context);
    });

    it('getMdContext should return modifiedContext', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['modifiedContext'] = context;
        const returnedContext = gameAreaService.getMdContext();
        expect(returnedContext).toEqual(context);
    });

    it('getOgFrontContext should return originalContextFrontLayer', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['originalContextFrontLayer'] = context;
        const returnedContext = gameAreaService.getOgFrontContext();
        expect(returnedContext).toEqual(context);
    });

    it('getMdFrontContext should return modifiedContextFrontLayer', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['modifiedContextFrontLayer'] = context;
        const returnedContext = gameAreaService.getMdFrontContext();
        expect(returnedContext).toEqual(context);
    });

    it('getMousePosition should return mousePosition', () => {
        gameAreaService['mousePosition'] = { x: 15, y: 150 };
        const returnedMousePosition = gameAreaService.getMousePosition();
        expect(returnedMousePosition).toEqual(gameAreaService['mousePosition']);
    });

    it('setOgContext should set originalContext', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService.setOgContext(context);
        expect(gameAreaService['originalContext']).toEqual(context);
    });

    it('setOgFrontContext should set originalContextFrontLayer', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService.setOgFrontContext(context);
        expect(gameAreaService['originalContextFrontLayer']).toEqual(context);
    });

    it('setMdContext should set modifiedContext', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService.setMdContext(context);
        expect(gameAreaService['modifiedContext']).toEqual(context);
    });

    it('setMdFrontContext should set modifiedContextFrontLayer', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService.setMdFrontContext(context);
        expect(gameAreaService['modifiedContextFrontLayer']).toEqual(context);
    });
});
