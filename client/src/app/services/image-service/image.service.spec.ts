import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { BLACK_PIXEL, N_PIXEL_ATTRIBUTE, WHITE_PIXEL } from '@app/constants/pixels';
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
        service['leftBackgroundContext'] = contextStub;
        service['rightBackgroundContext'] = contextStub;
        service['differenceContext'] = contextStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('areImagesSet should return true if both leftBackground and rightBackground are set', () => {
        const leftBackgroundImage = 'leftBackGroundImage';
        const rightBackgroundImage = 'rightBackgroundImage';
        service['leftBackground'] = leftBackgroundImage;
        service['rightBackground'] = rightBackgroundImage;
        expect(service.areImagesSet()).toBeTruthy();
    });

    it('areImagesSet should return false if either leftBackground or rightBackground is not set', () => {
        service['leftBackground'] = '';
        expect(service.areImagesSet()).toBeFalsy();
        service['leftBackground'] = 'left';
        service['rightBackground'] = '';
        expect(service.areImagesSet()).toBeFalsy();
    });

    it('resetBackground called with leftCanvasPosition should call resetLeftBackGround', () => {
        const resetLeftBackgroundSpy = spyOn(service, 'resetLeftBackground');
        service.resetBackground(CanvasPosition.Left);
        expect(resetLeftBackgroundSpy).toHaveBeenCalled();
    });

    it('resetBackground called with rightCanvasPosition should call resetRightBackground', () => {
        const resetRightBackgroundSpy = spyOn(service, 'resetRightBackground');
        service.resetBackground(CanvasPosition.Right);
        expect(resetRightBackgroundSpy).toHaveBeenCalled();
    });

    it('resetBackground called with bothCanvasPosition should call resetBothBackgrounds', () => {
        const resetBothBackgroundsSpy = spyOn(service, 'resetBothBackgrounds');
        service.resetBackground(CanvasPosition.Both);
        expect(resetBothBackgroundsSpy).toHaveBeenCalled();
    });

    it('resetLeftBackground should set leftBackground to empty string', () => {
        service['leftBackground'] = 'image';
        service.resetLeftBackground();
        expect(service['leftBackground']).toEqual('');
    });

    it('resetLeftBackground should call clearRect with appropriate values', () => {
        const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'clearRect');
        service.resetLeftBackground();
        expect(leftBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    });

    it('resetLeftBackground should draw a new image in leftBackgroundContext', () => {
        const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'drawImage');
        service.resetLeftBackground();
        expect(leftBackgroundContextSpy).toHaveBeenCalled();
    });

    it('resetRightBackground should set rightBackground to empty string', () => {
        service['rightBackground'] = 'image';
        service.resetRightBackground();
        expect(service['rightBackground']).toEqual('');
    });

    it('resetRightBackground should call clearRect with appropriate values', () => {
        const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'clearRect');
        service.resetRightBackground();
        expect(rightBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    });

    it('resetRightBackground should draw a new image in rightBackgroundContext', () => {
        const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'drawImage');
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

    it('setBackground called with leftCanvasPosition should call resetLeftBackground with appropriate image', () => {
        const image = new Image();
        const imageSource = 'image';
        image.src = imageSource;
        const setLeftBackgroundSpy = spyOn(service, 'setLeftBackground');
        service.setBackground(CanvasPosition.Left, imageSource);
        expect(setLeftBackgroundSpy).toHaveBeenCalledOnceWith(image);
    });

    it('setBackground called with rightCanvasPosition should call resetRightBackground with appropriate image', () => {
        const image = new Image();
        const imageSource = 'image';
        image.src = imageSource;
        const setRightBackgroundSpy = spyOn(service, 'setRightBackground');
        service.setBackground(CanvasPosition.Right, imageSource);
        expect(setRightBackgroundSpy).toHaveBeenCalledOnceWith(image);
    });

    it('setBackground called with bothCanvasPosition should call resetLeftBackground and resetRightBackground with appropriate image', () => {
        const image = new Image();
        const imageSource = 'image';
        image.src = imageSource;
        const setLeftBackgroundSpy = spyOn(service, 'setLeftBackground');
        const setRightBackgroundSpy = spyOn(service, 'setRightBackground');
        service.setBackground(CanvasPosition.Both, imageSource);
        expect(setLeftBackgroundSpy).toHaveBeenCalledOnceWith(image);
        expect(setRightBackgroundSpy).toHaveBeenCalledOnceWith(image);
    });

    it('setLeftBackground should set leftBackground to appropriate image', () => {
        const rightBackgroundImage = 'leftBackGroundImage';
        const image = new Image();
        image.src = rightBackgroundImage;
        expect(service['leftBackground']).not.toEqual(image.src);
        service.setLeftBackground(image);
        expect(service['leftBackground']).toEqual(image.src);
    });

    it('setLeftBackground should clear the leftBackgroundContext', () => {
        const leftBackgroundImage = new Image();
        const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'clearRect');
        service.setLeftBackground(leftBackgroundImage);
        expect(leftBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    });

    it('setLeftBackground should draw a new image in leftBackgroundContext', () => {
        const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'drawImage');
        service.setLeftBackground(new Image());
        expect(leftBackgroundContextSpy).toHaveBeenCalled();
    });

    it('setRightBackground should set rightBackground to appropriate image', () => {
        const rightBackgroundImage = 'rightBackGroundImage';
        const image = new Image();
        image.src = rightBackgroundImage;
        expect(service['rightBackground']).not.toEqual(rightBackgroundImage);
        service.setRightBackground(image);
        expect(service['rightBackground']).toEqual(image.src);
    });

    it('setRightBackground should clear the rightBackgroundContext', () => {
        const rightBackgroundImage = new Image();
        const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'clearRect');
        service.setLeftBackground(rightBackgroundImage);
        expect(rightBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    });

    it('setRightBackground should draw a new image in rightBackgroundContext', () => {
        const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'drawImage');
        service.setRightBackground(new Image());
        expect(rightBackgroundContextSpy).toHaveBeenCalled();
    });

    it('transformImageDataToPixelArray should return an array of pixels', () => {
        const imageData = new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE).fill(0);
        const pixelArray = new Array(IMG_WIDTH * IMG_HEIGHT).fill({
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        });
        expect(service.transformImageDataToPixelArray(imageData)).toEqual(pixelArray);
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

    it('getGamePixels should call transformContextToPixelArray with appropriate values', () => {
        const transformContextToPixelArraySpy = spyOn(service, 'transformImageDataToPixelArray' as never).and.callThrough();
        service.getGamePixels();
        expect(transformContextToPixelArraySpy).toHaveBeenCalled();
    });

    it('getImageSources should return the source of the images in the service', () => {
        service['leftBackground'] = 'leftBackground';
        service['rightBackground'] = 'rightBackground';
        expect(service.getImageSources()).toEqual({
            left: service['leftBackground'],
            right: service['rightBackground'],
        });
    });

    it('drawDifference should call transformContextToPixelArray with appropriate values', () => {
        const differencePixelArray = new Array(IMG_HEIGHT * IMG_WIDTH).fill(WHITE_PIXEL);
        const differenceImageData = service.transformPixelArrayToImageData(differencePixelArray);
        service.drawDifferenceImage(differencePixelArray);
        expect(differenceImageData).toEqual(differenceImageData);
    });

    it('drawDifference should call putImageData and not change a image fill with WHITE_PIXEL', () => {
        const differencePixelArray = new Array(IMG_HEIGHT * IMG_WIDTH).fill(WHITE_PIXEL);
        spyOn(contextStub, 'putImageData');
        service.drawDifferenceImage(differencePixelArray);
        expect(contextStub.putImageData).toHaveBeenCalled();
        expect(differencePixelArray).toContain(WHITE_PIXEL);
    });

    it('drawDifference should call putImageData and fill pixel with difference by BLACK_PIXEL', () => {
        const differencePixelArray = new Array(IMG_HEIGHT * IMG_WIDTH).fill({ red: 0, green: 0, blue: 0, alpha: 255 });
        spyOn(contextStub, 'putImageData');
        service.drawDifferenceImage(differencePixelArray);
        expect(contextStub.putImageData).toHaveBeenCalled();
        expect(differencePixelArray).toContain(BLACK_PIXEL);
    });
});
