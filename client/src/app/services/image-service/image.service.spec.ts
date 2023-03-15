// needed for private methods
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { N_PIXEL_ATTRIBUTE } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let service: ImageService;
    let contextStub: CanvasRenderingContext2D;
    let imageBitmap: ImageBitmap;
    let foregroundServiceSpy: jasmine.SpyObj<ForegroundService>;

    beforeEach(() => {
        foregroundServiceSpy = jasmine.createSpyObj('ForegroundService', ['getForegroundCanvasElements']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: ForegroundService, useValue: foregroundServiceSpy }],
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
        expect(service['combinedContext']).not.toEqual(contextStub);
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

    it('drawDifference should call transformPixelArrayToImageData', () => {
        const transformPixelArrayToImageDataSpy = spyOn<any>(service, 'transformPixelArrayToImageData').and.callFake(() => {
            return new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE).fill(0);
        });

        const mockDifferences = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];

        service.drawDifferences(contextStub, mockDifferences);
        expect(transformPixelArrayToImageDataSpy).toHaveBeenCalled();
    });

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

    it('generateGamePixels should foregroundService.getForegroundCanvasElements and generatePixels with the correct parameters', () => {
        const generatePixelsSpy = spyOn<any>(service, 'generatePixels').and.callFake(() => {
            return [];
        });
        const fakeLeftForegroundCanvas = {
            width: 0,
        } as HTMLCanvasElement;
        const fakeRightForegroundCanvas = {
            width: 1,
        } as HTMLCanvasElement;

        foregroundServiceSpy.getForegroundCanvasElements.and.returnValue({
            left: fakeLeftForegroundCanvas,
            right: fakeRightForegroundCanvas,
        });
        service.generateGamePixels();
        expect(foregroundServiceSpy.getForegroundCanvasElements).toHaveBeenCalled();
        expect(generatePixelsSpy).toHaveBeenCalledWith(fakeLeftForegroundCanvas, CanvasPosition.Left);
        expect(generatePixelsSpy).toHaveBeenCalledWith(fakeRightForegroundCanvas, CanvasPosition.Right);
    });

    it('getImageSources should return the source of the images in the service', () => {
        service['leftImage'] = 'leftImage';
        service['rightImage'] = 'rightImage';
        expect(service.getImageSources()).toEqual({
            left: service['leftImage'],
            right: service['rightImage'],
        });
    });

    it('setBackgroundImage should call clearRect and drawImage on the context its called with', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        const clearRectSpy = spyOn(contextStub, 'clearRect').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        const drawImageSpy = spyOn(contextStub, 'drawImage').and.callFake(() => {});

        service['setBackgroundImage'](imageBitmap, contextStub);
        expect(clearRectSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('setBackgroundImage should call fillRect on the context its called with and change fillStyle', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        const fillRectSpy = spyOn(contextStub, 'fillRect').and.callFake(() => {});
        const backgroundColor = '#ffffff';

        expect(contextStub.fillStyle).not.toEqual(backgroundColor);
        service['resetBackgroundContext'](contextStub);
        expect(fillRectSpy).toHaveBeenCalled();
        expect(contextStub.fillStyle).toEqual(backgroundColor);
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

    it('generatePixels should call combineCanvas and setImage', () => {
        service['combinedContext'] = contextStub;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        const combineCanvasSpy = spyOn<any>(service, 'combineCanvas').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        const setImageSpy = spyOn<any>(service, 'setImage').and.callFake(() => {});
        const fakeCanvas = {} as HTMLCanvasElement;

        service['generatePixels'](fakeCanvas, CanvasPosition.Left);
        expect(combineCanvasSpy).toHaveBeenCalled();
        expect(setImageSpy).toHaveBeenCalled();
    });

    it('generatePixels should call getImageData on combinedContext and transformImageToDataPixelArray with his data', () => {
        service['combinedContext'] = contextStub;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        spyOn<any>(service, 'combineCanvas').and.callFake(() => {});
        const fakeCanvas = {} as HTMLCanvasElement;
        const mockImageData = new ImageData(1, 1);

        const getImageDataSpy = spyOn(contextStub, 'getImageData').and.callFake(() => {
            return mockImageData;
        });

        const transformImageDataToPixelArraySpy = spyOn<any>(service, 'transformImageDataToPixelArray').and.callFake(() => {
            return [];
        });

        service['generatePixels'](fakeCanvas, CanvasPosition.Right);
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(transformImageDataToPixelArraySpy).toHaveBeenCalledOnceWith(mockImageData.data);
    });

    it('setImage called with leftCanvasPosition should set leftImage', () => {
        const leftImage = 'leftImage';
        expect(service['leftImage']).not.toEqual(leftImage);
        service['setImage'](CanvasPosition.Left, leftImage);
        expect(service['leftImage']).toEqual(leftImage);
    });

    it('setImage called with rightCanvasPosition should set rightImage', () => {
        const rightImage = 'rightImage';
        expect(service['rightImage']).not.toEqual(rightImage);
        service['setImage'](CanvasPosition.Right, rightImage);
        expect(service['rightImage']).toEqual(rightImage);
    });

    it('combineCanvas should call drawImage twice on the provided canvas', () => {
        service['combinedContext'] = contextStub;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        const drawImageSpy = spyOn(contextStub, 'drawImage').and.callFake(() => {});

        const firstFakeCanvas = {} as HTMLCanvasElement;
        const secondFakeCanvas = {} as HTMLCanvasElement;
        service['combineCanvas'](firstFakeCanvas, secondFakeCanvas);
        expect(drawImageSpy).toHaveBeenCalledTimes(2);
    });
});
