// needed for private methods
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { N_PIXEL_ATTRIBUTE } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';
// import { CanvasPosition } from '@app/enum/canvas-position';

import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;
    let contextStub: CanvasRenderingContext2D;
    let resetBackgroundContextSpy: jasmine.Spy;
    let setBackgroundImageSpy: jasmine.Spy;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ImageService);
        contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        resetBackgroundContextSpy = spyOn<any>(service, 'resetBackgroundContext');
        setBackgroundImageSpy = spyOn<any>(service, 'setBackgroundImage');
        service['leftBackgroundContext'] = contextStub;
        service['rightBackgroundContext'] = contextStub;
    });

    // beforeEach(async () => {
    //     imageBitmap = await createImageBitmap(new ImageData(IMG_WIDTH, IMG_HEIGHT));
    // });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('resetBackground called with leftCanvasPosition should call resetLeftBackGround', () => {
    //     const resetLeftBackgroundSpy = spyOn(service, 'resetLeftBackground');
    //     service.resetBackground(CanvasPosition.Left);
    //     expect(resetLeftBackgroundSpy).toHaveBeenCalled();
    // });

    // it('resetBackground called with rightCanvasPosition should call resetRightBackground', () => {
    //     const resetRightBackgroundSpy = spyOn(service, 'resetRightBackground');
    //     service.resetBackground(CanvasPosition.Right);
    //     expect(resetRightBackgroundSpy).toHaveBeenCalled();
    // });

    // it('resetBackground called with bothCanvasPosition should call resetBothBackgrounds', () => {
    //     const resetBothBackgroundsSpy = spyOn(service, 'resetBothBackgrounds');
    //     service.resetBackground(CanvasPosition.Both);
    //     expect(resetBothBackgroundsSpy).toHaveBeenCalled();
    // });

    // it('resetLeftBackground should set leftBackground to empty string', () => {
    //     service['leftBackground'] = 'image';
    //     service.resetLeftBackground();
    //     expect(service['leftBackground']).toEqual('');
    // });

    // it('resetLeftBackground should call clearRect with appropriate values', () => {
    //     const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'clearRect');
    //     service.resetLeftBackground();
    //     expect(leftBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    // });

    // it('resetLeftBackground should draw a new image in leftBackgroundContext', () => {
    //     const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'drawImage');
    //     service.resetLeftBackground();
    //     expect(leftBackgroundContextSpy).toHaveBeenCalled();
    // });

    // it('resetRightBackground should set rightBackground to empty string', () => {
    //     service['rightBackground'] = 'image';
    //     service.resetRightBackground();
    //     expect(service['rightBackground']).toEqual('');
    // });

    // it('resetRightBackground should call clearRect with appropriate values', () => {
    //     const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'clearRect');
    //     service.resetRightBackground();
    //     expect(rightBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    // });

    // it('resetRightBackground should draw a new image in rightBackgroundContext', () => {
    //     const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'drawImage');
    //     service.resetRightBackground();
    //     expect(rightBackgroundContextSpy).toHaveBeenCalled();
    // });

    // it('resetBothBackgrounds should call resetLeftBackGround and resetRightBackGround', () => {
    //     const resetLeftBackgroundSpy = spyOn(service, 'resetLeftBackground');
    //     const resetRightBackgroundSpy = spyOn(service, 'resetRightBackground');
    //     service.resetBothBackgrounds();
    //     expect(resetLeftBackgroundSpy).toHaveBeenCalled();
    //     expect(resetRightBackgroundSpy).toHaveBeenCalled();
    // });

    // it('setBackground called with leftCanvasPosition should call resetLeftBackground with appropriate image', () => {
    //     const setLeftBackgroundSpy = spyOn(service, 'setLeftBackground');
    //     service.setBackground(CanvasPosition.Left, imageBitmap);
    //     expect(setLeftBackgroundSpy).toHaveBeenCalledOnceWith(imageBitmap);
    // });

    // it('setBackground called with rightCanvasPosition should call resetRightBackground with appropriate image', () => {
    //     const setRightBackgroundSpy = spyOn(service, 'setRightBackground');
    //     service.setBackground(CanvasPosition.Right, imageBitmap);
    //     expect(setRightBackgroundSpy).toHaveBeenCalledOnceWith(imageBitmap);
    // });

    // it('setBackground called with bothCanvasPosition should call resetLeftBackground and resetRightBackground with appropriate image', () => {
    //     const setLeftBackgroundSpy = spyOn(service, 'setLeftBackground');
    //     const setRightBackgroundSpy = spyOn(service, 'setRightBackground');
    //     service.setBackground(CanvasPosition.Both, imageBitmap);
    //     expect(setLeftBackgroundSpy).toHaveBeenCalledOnceWith(imageBitmap);
    //     expect(setRightBackgroundSpy).toHaveBeenCalledOnceWith(imageBitmap);
    // });

    // it('setLeftBackground should set leftBackground to appropriate image', () => {
    //     const newContextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    //     newContextStub.drawImage(imageBitmap, 0, 0);
    //     const leftBackground = newContextStub.canvas.toDataURL();

    //     expect(service['leftBackground']).not.toEqual(leftBackground);
    //     service.setLeftBackground(imageBitmap);
    //     expect(service['leftBackground']).toEqual(leftBackground);
    // });

    // it('setLeftBackground should clear the leftBackgroundContext', () => {
    //     const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'clearRect');
    //     service.setLeftBackground(imageBitmap);
    //     expect(leftBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    // });

    // it('setLeftBackground should draw a new image in leftBackgroundContext', () => {
    //     const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'drawImage');
    //     service.setLeftBackground(imageBitmap);
    //     expect(leftBackgroundContextSpy).toHaveBeenCalled();
    // });

    // it('setRightBackground should set rightBackground to appropriate image', () => {
    //     const newContextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    //     newContextStub.drawImage(imageBitmap, 0, 0);
    //     const rightBackground = newContextStub.canvas.toDataURL();

    //     expect(service['rightBackground']).not.toEqual(rightBackground);
    //     service.setRightBackground(imageBitmap);
    //     expect(service['rightBackground']).toEqual(rightBackground);
    // });

    // it('setRightBackground should clear the rightBackgroundContext', () => {
    //     const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'clearRect');
    //     service.setLeftBackground(imageBitmap);
    //     expect(rightBackgroundContextSpy).toHaveBeenCalledOnceWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    // });

    // it('setRightBackground should draw a new image in rightBackgroundContext', () => {
    //     const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'drawImage');
    //     service.setRightBackground(imageBitmap);
    //     expect(rightBackgroundContextSpy).toHaveBeenCalled();
    // });

    it('resetBackground should reset background context for left canvas position', () => {
        service.resetBackground(CanvasPosition.Left);
        expect(resetBackgroundContextSpy).toHaveBeenCalled();
    });

    it('resetBackground should reset background context for right canvas position', () => {
        service.resetBackground(CanvasPosition.Right);
        expect(resetBackgroundContextSpy).toHaveBeenCalled();
    });

    it('resetBackground should reset background context for both canvas positions', () => {
        service.resetBackground(CanvasPosition.Both);
        expect(resetBackgroundContextSpy).toHaveBeenCalled();
        expect(resetBackgroundContextSpy).toHaveBeenCalled();
    });

    it('setBackground should set the background image for left canvas position', () => {
        const mockImage = {} as ImageBitmap;
        spyOn(window, 'createImageBitmap').and.callFake(async () => {
            return mockImage;
        });
        service.setBackground(CanvasPosition.Left, mockImage);
        expect(setBackgroundImageSpy).toHaveBeenCalled();
    });

    it('setBackground should set the background image for right canvas position', () => {
        const mockImage = {} as ImageBitmap;
        spyOn(window, 'createImageBitmap').and.callFake(async () => {
            return mockImage;
        });
        service.setBackground(CanvasPosition.Right, mockImage);
        expect(setBackgroundImageSpy).toHaveBeenCalled();
    });

    it('setBackground should set the background image for both canvas positions', () => {
        const mockImage = {} as ImageBitmap;
        spyOn(window, 'createImageBitmap').and.callFake(async () => {
            return mockImage;
        });
        service.setBackground(CanvasPosition.Both, mockImage);
        expect(setBackgroundImageSpy).toHaveBeenCalled();
        expect(setBackgroundImageSpy).toHaveBeenCalled();
    });

    it('transformImageDataToPixelArray should return an array of pixels', () => {
        const imageData = new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE).fill(0);
        const pixelArray = new Array(IMG_WIDTH * IMG_HEIGHT).fill({
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        });
        expect(service['transformImageDataToPixelArray'](imageData)).toEqual(pixelArray);
    });

    it('transformPixelArrayToImageData should return an array of Uint8Values', () => {
        const pixelArray = new Array(IMG_WIDTH * IMG_HEIGHT).fill({
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        });
        const expectedArray = new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE).fill(0);
        expect(service['transformPixelArrayToImageData'](pixelArray)).toEqual(expectedArray);
    });

    // it('getLeftPixels should call getImageData of leftBackgroundContext', () => {
    //     const leftBackgroundContextSpy = spyOn(service['leftBackgroundContext'], 'getImageData').and.callThrough();
    //     service.getLeftPixels();
    //     expect(leftBackgroundContextSpy).toHaveBeenCalledWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    // });

    // it('getLeftPixels should call transformImageDataToPixelArray with leftDataImage', () => {
    //     const leftImageData = new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE).fill(0);
    //     spyOn(service['leftBackgroundContext'], 'getImageData').and.callFake(() => {
    //         return { data: leftImageData, colorSpace: 'srgb', width: IMG_WIDTH, height: IMG_HEIGHT };
    //     });
    //     const transformImageDataToPixelArraySpy = spyOn(service, 'transformImageDataToPixelArray').and.callFake(() => {
    //         return [];
    //     });

    //     service.getLeftPixels();
    //     expect(transformImageDataToPixelArraySpy).toHaveBeenCalledWith(leftImageData);
    // });

    // it('getRightPixels should call getImageData of rightBackgroundContext', () => {
    //     const rightBackgroundContextSpy = spyOn(service['rightBackgroundContext'], 'getImageData').and.callThrough();
    //     service.getRightPixels();
    //     expect(rightBackgroundContextSpy).toHaveBeenCalledWith(0, 0, IMG_WIDTH, IMG_HEIGHT);
    // });

    // it('getRightPixels should call transformImageDataToPixelArray with rightDataImage', () => {
    //     const rightImageData = new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE).fill(1);
    //     spyOn(service['rightBackgroundContext'], 'getImageData').and.callFake(() => {
    //         return { data: rightImageData, colorSpace: 'srgb', width: IMG_WIDTH, height: IMG_HEIGHT };
    //     });

    //     const transformImageDataToPixelArraySpy = spyOn(service, 'transformImageDataToPixelArray').and.callFake(() => {
    //         return [];
    //     });

    //     service.getRightPixels();
    //     expect(transformImageDataToPixelArraySpy).toHaveBeenCalledWith(rightImageData);
    // });

    // it('getGamePixels should return pixels of both images', () => {
    //     const leftPixels = new Array(IMG_WIDTH * IMG_HEIGHT).fill({ red: 0, green: 0, blue: 0, alpha: 0 });
    //     const rightPixels = new Array(IMG_WIDTH * IMG_HEIGHT).fill({ red: 1, green: 1, blue: 1, alpha: 1 });
    //     spyOn(service, 'getLeftPixels').and.callFake(() => {
    //         return leftPixels;
    //     });
    //     spyOn(service, 'getRightPixels').and.callFake(() => {
    //         return rightPixels;
    //     });

    //     expect(service.getGamePixels()).toEqual({ leftImage: leftPixels, rightImage: rightPixels });
    // });

    // it('getImageSources should return the source of the images in the service', () => {
    //     service['leftBackground'] = 'leftBackground';
    //     service['rightBackground'] = 'rightBackground';
    //     expect(service.getImageSources()).toEqual({
    //         left: service['leftBackground'],
    //         right: service['rightBackground'],
    //     });
    // });

    // it('drawDifference should call transformPixelArrayToImageData', () => {
    //     const transformPixelArrayToImageDataSpy = spyOn(service, 'transformPixelArrayToImageData').and.callFake(() => {
    //         return new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE).fill(0);
    //     });

    //     const mockDifferences = [
    //         { x: 0, y: 0 },
    //         { x: 1, y: 1 },
    //     ];

    //     service.drawDifferences(contextStub, mockDifferences);
    //     expect(transformPixelArrayToImageDataSpy).toHaveBeenCalled();
    // });

    it('drawDifference should call putImageData on provided context', () => {
        const mockDifferences = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];

        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        const putImageDataSpy = spyOn(contextStub, 'putImageData').and.callFake(() => {});

        service.drawDifferences(contextStub, mockDifferences);
        expect(putImageDataSpy).toHaveBeenCalled();
    });
});
