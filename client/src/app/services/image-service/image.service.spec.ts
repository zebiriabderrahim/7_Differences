import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { N_PIXEL_ATTRIBUTE } from '@app/constants/pixels';
// import { BLACK_PIXEL, N_PIXEL_ATTRIBUTE, WHITE_PIXEL } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';

import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;
    let contextStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ImageService);
        contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.leftBackgroundContext = contextStub;
        service.rightBackgroundContext = contextStub;
        service.differenceContext = contextStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('resetBackground called with leftCanvasPosition should call resetLeftBackGround', () => {
        const resetLeftBackgroundSpy = spyOn(service, 'resetLeftBackground');
        const leftCanvasPosition = CanvasPosition.Left;
        service.resetBackground(leftCanvasPosition);
        expect(resetLeftBackgroundSpy).toHaveBeenCalled();
    });

    it('resetBackground called with rightCanvasPosition should call resetRightBackground', () => {
        const resetRightBackgroundSpy = spyOn(service, 'resetRightBackground');
        const rightCanvasPosition = CanvasPosition.Right;
        service.resetBackground(rightCanvasPosition);
        expect(resetRightBackgroundSpy).toHaveBeenCalled();
    });

    it('resetLeftBackground should set leftBackground to empty string', () => {
        service.leftBackground = 'image';
        service.resetLeftBackground();
        expect(service.leftBackground).toEqual('');
    });

    it('resetLeftBackground should call clearRect with appropriate values', () => {
        const leftBackgroundContextSpy = spyOn(service.leftBackgroundContext, 'clearRect');
        service.resetLeftBackground();
        expect(leftBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    });

    // TODO: verify called values?
    it('resetLeftBackground should draw a new image in leftBackgroundContext', () => {
        const leftBackgroundContextSpy = spyOn(service.leftBackgroundContext, 'drawImage');
        service.resetLeftBackground();
        expect(leftBackgroundContextSpy).toHaveBeenCalled();
    });

    it('resetRightBackground should set rightBackground to empty string', () => {
        service.rightBackground = 'image';
        service.resetRightBackground();
        expect(service.rightBackground).toEqual('');
    });

    it('resetRightBackground should call clearRect with appropriate values', () => {
        const rightBackgroundContextSpy = spyOn(service.rightBackgroundContext, 'clearRect');
        service.resetRightBackground();
        expect(rightBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    });

    // TODO: verify called values?
    it('resetRightBackground should draw a new image in rightBackgroundContext', () => {
        const rightBackgroundContextSpy = spyOn(service.rightBackgroundContext, 'drawImage');
        service.resetRightBackground();
        expect(rightBackgroundContextSpy).toHaveBeenCalled();
    });

    it('resetBothBackgrounds should call resetLeftBackGround and resetRightBackGround', () => {
        const resetLeftBackgroundSpy = spyOn(service, 'resetLeftBackground');
        const resetRightBackgroundSpy = spyOn(service, 'resetRightBackground');
        service.resetBothBackgrounds();
        expect(resetLeftBackgroundSpy).toHaveBeenCalled();
        expect(resetRightBackgroundSpy).toHaveBeenCalled();
    });

    it('setLeftBackground should set leftBackground to appropriate image', () => {
        const leftBackgroundImage = 'leftBackGroundImage';
        expect(service.leftBackground).not.toEqual(leftBackgroundImage);
        service.setLeftBackground(leftBackgroundImage);
        expect(service.leftBackground).toEqual(leftBackgroundImage);
    });

    it('setLeftBackground should clear the leftBackgroundContext', () => {
        const leftBackgroundImage = 'leftBackGroundImage';
        const leftBackgroundContextSpy = spyOn(service.leftBackgroundContext, 'clearRect');
        service.setLeftBackground(leftBackgroundImage);
        expect(leftBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    });

    it('setRightBackground should set rightBackground to appropriate image', () => {
        const rightBackgroundImage = 'rightBackGroundImage';
        expect(service.rightBackground).not.toEqual(rightBackgroundImage);
        service.setRightBackground(rightBackgroundImage);
        expect(service.rightBackground).toEqual(rightBackgroundImage);
    });

    it('setRightBackground should clear the rightBackgroundContext', () => {
        const rightBackgroundImage = 'rightBackGroundImage';
        const rightBackgroundContextSpy = spyOn(service.rightBackgroundContext, 'clearRect');
        service.setLeftBackground(rightBackgroundImage);
        expect(rightBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    });

    it('setBackground called with rightCanvasPosition should call resetRightBackground with appropriate image', () => {
        const image = 'image';
        const rightCanvasPosition = CanvasPosition.Right;
        const setRightBackgroundSpy = spyOn(service, 'setRightBackground');
        service.setBackground(rightCanvasPosition, image);
        expect(setRightBackgroundSpy).toHaveBeenCalledOnceWith(image);
    });

    it('setBackground called with leftCanvasPosition should call resetLeftBackground with appropriate image', () => {
        const image = 'image';
        const leftCanvasPosition = CanvasPosition.Left;
        const setLeftBackgroundSpy = spyOn(service, 'setLeftBackground');
        service.setBackground(leftCanvasPosition, image);
        expect(setLeftBackgroundSpy).toHaveBeenCalledOnceWith(image);
    });

    it('setEnlargementR', () => {
        service.leftBackground = '';
        service.rightBackground = '';
        const validateDifferencesSpy = spyOn(service, 'validateDifferences');
        service.setDifferenceContext(contextStub);
        expect(validateDifferencesSpy).not.toHaveBeenCalled();
    });

    it('setDifferenceContext should not call validateDifferences if backgrounds are not set', () => {
        service.leftBackground = '';
        service.rightBackground = '';
        const validateDifferencesSpy = spyOn(service, 'validateDifferences');
        service.setDifferenceContext(contextStub);
        expect(validateDifferencesSpy).not.toHaveBeenCalled();
    });

    it('setDifferenceContext should not call validateDifferences if both backgrounds are not set', () => {
        service.leftBackground = 'leftBackground';
        service.rightBackground = '';
        const validateDifferencesSpy = spyOn(service, 'validateDifferences');
        service.setDifferenceContext(contextStub);
        expect(validateDifferencesSpy).not.toHaveBeenCalled();
    });

    it('setDifferenceContext should call validateDifferences if both backgrounds are set', () => {
        service.leftBackground = 'leftBackground';
        service.rightBackground = 'rightBackground';
        const validateDifferencesSpy = spyOn(service, 'validateDifferences');
        service.setDifferenceContext(contextStub);
        expect(validateDifferencesSpy).toHaveBeenCalled();
    });

    it('setBothBackgrounds should call setLeftBackground and setRightBackground with appropriate image', () => {
        const image = 'image';
        const setLeftBackgroundSpy = spyOn(service, 'setLeftBackground');
        const setRightBackgroundSpy = spyOn(service, 'setRightBackground');
        service.setBothBackgrounds(image);
        expect(setLeftBackgroundSpy).toHaveBeenCalledOnceWith(image);
        expect(setRightBackgroundSpy).toHaveBeenCalledOnceWith(image);
    });

    it('transformContextToPixelArray should return an array of pixels', () => {
        const pixelArray = new Array(IMG_WIDTH * IMG_HEIGHT).fill({
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        });
        expect(service.transformContextToPixelArray(contextStub)).toEqual(pixelArray);
    });

    it('transformPixelArrayToImageData should return an array of Uint8Values', () => {
        const pixelArray = new Array(IMG_WIDTH * IMG_HEIGHT).fill({
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        });
        const expectedArray = new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE).fill(0);
        expect(service.transformPixelArrayToImageData(pixelArray)).toEqual(expectedArray);
    });

    it('validateDifferences should call transformContextToPixelArray with appropriate values', () => {
        const transformContextToPixelArraySpy = spyOn(service, 'transformContextToPixelArray').and.callFake(() => {
            return [];
        });
        service.validateDifferences();
        expect(transformContextToPixelArraySpy).toHaveBeenCalledWith(service.leftBackgroundContext);
        expect(transformContextToPixelArraySpy).toHaveBeenCalledWith(service.rightBackgroundContext);
    });

    it('validateDifferences should call drawDifferences', () => {
        const drawDifferencesSpy = spyOn(service, 'drawDifferences').and.callFake(() => {
            return [];
        });
        service.validateDifferences();
        expect(drawDifferencesSpy).toHaveBeenCalled();
    });

    // TODO: test drawDifferences without imageData failing

    it('createGame should call resetBothBackgrounds', () => {
        const name = 'name';
        const resetBothBackgroundsSpy = spyOn(service, 'resetBothBackgrounds');
        service.createGame(name);
        expect(resetBothBackgroundsSpy).toHaveBeenCalled();
    });
});
