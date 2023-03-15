// needed for private methods
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { N_PIXEL_ATTRIBUTE } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;
    let contextStub: CanvasRenderingContext2D;
    let imageBitmap: ImageBitmap;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ImageService);
        contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service['leftBackgroundContext'] = contextStub;
        service['rightBackgroundContext'] = contextStub;
    });

    beforeEach(async () => {
        imageBitmap = await createImageBitmap(new ImageData(IMG_WIDTH, IMG_HEIGHT));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('resetBackground called with leftCanvasPosition should call resetBackgroundContext with leftBackgroundContext', () => {
        const resetBackgroundContextSpy = spyOn<any>(service, 'resetBackgroundContext').and.callThrough();
        service.resetBackground(CanvasPosition.Left);
        expect(resetBackgroundContextSpy).toHaveBeenCalledOnceWith(service['leftBackgroundContext']);
    });

    it('resetBackground called with rightCanvasPosition should call resetBackgroundContext with rightBackgroundContext', () => {
        const resetBackgroundContextSpy = spyOn<any>(service, 'resetBackgroundContext').and.callThrough();
        service.resetBackground(CanvasPosition.Right);
        expect(resetBackgroundContextSpy).toHaveBeenCalledOnceWith(service['rightBackgroundContext']);
    });

    it('resetBackground called with CanvasPosition both should call resetBackgroundContext with both background context', () => {
        const resetBackgroundContextSpy = spyOn<any>(service, 'resetBackgroundContext').and.callThrough();
        service.resetBackground(CanvasPosition.Both);
        expect(resetBackgroundContextSpy).toHaveBeenCalledWith(service['leftBackgroundContext']);
        expect(resetBackgroundContextSpy).toHaveBeenCalledWith(service['rightBackgroundContext']);
    });

    it('setBackground called with leftCanvasPosition should call setBackgroundImage with leftBackgroundContext', () => {
        const setBackgroundImageSpy = spyOn<any>(service, 'setBackgroundImage').and.callThrough();
        service.setBackground(CanvasPosition.Left, imageBitmap);
        expect(setBackgroundImageSpy).toHaveBeenCalledOnceWith(imageBitmap, service['leftBackgroundContext']);
    });

    it('setBackground called with rightCanvasPosition should call setBackgroundImage with rightBackgroundContext', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const setBackgroundImageSpy = spyOn<any>(service, 'setBackgroundImage').and.callThrough();
        service.setBackground(CanvasPosition.Right, imageBitmap);
        expect(setBackgroundImageSpy).toHaveBeenCalledOnceWith(imageBitmap, service['rightBackgroundContext']);
    });

    it('setBackground called with CanvasPosition both should call setBackgroundImage with both background context', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const setBackgroundImageSpy = spyOn<any>(service, 'setBackgroundImage').and.callFake(() => {});
        service.setBackground(CanvasPosition.Both, imageBitmap);
        expect(setBackgroundImageSpy).toHaveBeenCalledWith(imageBitmap, service['leftBackgroundContext']);
        expect(setBackgroundImageSpy).toHaveBeenCalledWith(imageBitmap, service['rightBackgroundContext']);
    });

    it('setCombinedContext should set combinedContext', () => {
        expect(service['combinedContext']).toBeUndefined();
        service.setCombinedContext(contextStub);
        expect(service['combinedContext']).toEqual(contextStub);
    });

    it('setBackgroundContext called with leftCanvasPosition should set the leftBackgroundContext and call resetBackgroundContext with it', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const resetBackgroundContextSpy = spyOn<any>(service, 'resetBackgroundContext').and.callFake(() => {});
        const mockLeftBackgroundContext = {} as CanvasRenderingContext2D;
        expect(service['leftBackgroundContext']).not.toEqual(mockLeftBackgroundContext);
        service.setBackgroundContext(CanvasPosition.Left, mockLeftBackgroundContext);
        expect(service['leftBackgroundContext']).toEqual(mockLeftBackgroundContext);
        expect(resetBackgroundContextSpy).toHaveBeenCalledOnceWith(mockLeftBackgroundContext);
    });

    it('setBackgroundContext called with rightCanvasPosition should set the rightBackgroundContext and call resetBackgroundContext with it', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for callFake
        const resetBackgroundContextSpy = spyOn<any>(service, 'resetBackgroundContext').and.callFake(() => {});
        const mockRightBackgroundContext = {} as CanvasRenderingContext2D;
        expect(service['rightBackgroundContext']).not.toEqual(mockRightBackgroundContext);
        service.setBackgroundContext(CanvasPosition.Right, mockRightBackgroundContext);
        expect(service['rightBackgroundContext']).toEqual(mockRightBackgroundContext);
        expect(resetBackgroundContextSpy).toHaveBeenCalledOnceWith(mockRightBackgroundContext);
    });

    // it('setBackground should set the background image for right canvas position', () => {
    //     const mockImage = {} as ImageBitmap;
    //     spyOn(window, 'createImageBitmap').and.callFake(async () => {
    //         return mockImage;
    //     });
    //     service.setBackground(CanvasPosition.Right, mockImage);
    //     expect(setBackgroundImageSpy).toHaveBeenCalled();
    // });

    // it('setBackground should set the background image for both canvas positions', () => {
    //     const mockImage = {} as ImageBitmap;
    //     spyOn(window, 'createImageBitmap').and.callFake(async () => {
    //         return mockImage;
    //     });
    //     service.setBackground(CanvasPosition.Both, mockImage);
    //     expect(setBackgroundImageSpy).toHaveBeenCalled();
    //     expect(setBackgroundImageSpy).toHaveBeenCalled();
    // });

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

    it('getImageSources should return image sources for both left and right', () => {
        const fakeLeftImage = 'fakeLeftImage';
        const fakeRightImage = 'fakeRightImage';
        service['leftImage'] = fakeLeftImage;
        service['rightImage'] = fakeRightImage;
        const result = service.getImageSources();
        expect(result.left).toEqual(fakeLeftImage);
        expect(result.right).toEqual(fakeRightImage);
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

    // it('drawDifference should call putImageData on provided context', () => {
    //     const mockDifferences = [
    //         { x: 0, y: 0 },
    //         { x: 1, y: 1 },
    //     ];

    //     // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
    //     const putImageDataSpy = spyOn(contextStub, 'putImageData').and.callFake(() => {});

    //     service.drawDifferences(contextStub, mockDifferences);
    //     expect(putImageDataSpy).toHaveBeenCalled();
    // });
});
