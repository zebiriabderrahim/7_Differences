// needed to spy on private methods
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundCanvasElements } from '@app/interfaces/foreground-canvas-elements';
import { ForegroundService } from './foreground.service';

describe('ForegroundService', () => {
    let service: ForegroundService;
    let contextStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ForegroundService);
        contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setForegroundContext called with leftCanvasPosition should set leftForegroundContext and leftFrontContext', () => {
        expect(service['leftForegroundContext']).not.toBe(contextStub);
        expect(service['leftFrontContext']).not.toBe(contextStub);
        service.setForegroundContext(CanvasPosition.Left, contextStub, contextStub);
        expect(service['leftForegroundContext']).toBe(contextStub);
        expect(service['leftFrontContext']).toBe(contextStub);
    });

    it('setForegroundContext called with rightCanvasPosition should set rightForegroundContext and rightFrontContext', () => {
        expect(service['rightForegroundContext']).not.toBe(contextStub);
        expect(service['rightFrontContext']).not.toBe(contextStub);
        service.setForegroundContext(CanvasPosition.Right, contextStub, contextStub);
        expect(service['rightForegroundContext']).toBe(contextStub);
        expect(service['rightFrontContext']).toBe(contextStub);
    });

    it('resetForeground called with leftCanvasPosition resetCanvasContext with leftForegroundContext and saveCurrentForegroundState', () => {
        service['leftForegroundContext'] = contextStub;
        const resetCanvasContextSpy = spyOn<any>(service, 'resetCanvasContext');
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState');
        service.resetForeground(CanvasPosition.Left);
        expect(resetCanvasContextSpy).toHaveBeenCalledOnceWith(service['leftForegroundContext']);
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
    });

    it('resetForeground called with rightCanvasPosition resetCanvasContext with rightForegroundContext and saveCurrentForegroundState', () => {
        service['rightForegroundContext'] = contextStub;
        const resetCanvasContextSpy = spyOn<any>(service, 'resetCanvasContext');
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState');
        service.resetForeground(CanvasPosition.Right);
        expect(resetCanvasContextSpy).toHaveBeenCalledOnceWith(service['rightForegroundContext']);
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
    });

    it('resetForeground called with CanvasPosition.Both should call resetCanvasContext with both foregrounds contexts', () => {
        service['leftForegroundContext'] = contextStub;
        service['rightForegroundContext'] = {} as CanvasRenderingContext2D;
        const resetCanvasContextSpy = spyOn<any>(service, 'resetCanvasContext');
        service.resetForeground(CanvasPosition.Both);
        expect(resetCanvasContextSpy).toHaveBeenCalledWith(service['leftForegroundContext']);
        expect(resetCanvasContextSpy).toHaveBeenCalledWith(service['rightForegroundContext']);
    });

    it('getForegroundCanvasElements should return left and right foregrounds canvas', () => {
        const mockLeftCanvas = 'leftCanvas' as unknown as HTMLCanvasElement;
        const mockRightCanvas = 'rightCanvas' as unknown as HTMLCanvasElement;
        service['leftForegroundContext'] = { canvas: mockLeftCanvas } as CanvasRenderingContext2D;
        service['rightForegroundContext'] = { canvas: mockRightCanvas } as CanvasRenderingContext2D;
        const foregroundCanvasElements: ForegroundCanvasElements = {
            left: mockLeftCanvas,
            right: mockRightCanvas,
        };
        expect(service.getForegroundCanvasElements()).toEqual(foregroundCanvasElements);
    });

    it('swapForegrounds should call getImageData and putImageData on both foregroundContexts and save foregrounds state', () => {
        const secondContextStub = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        service['leftForegroundContext'] = contextStub;
        service['rightForegroundContext'] = secondContextStub;

        const leftForegroundGetImageDataSpy = spyOn(service['leftForegroundContext'], 'getImageData').and.callFake(() => {
            return {} as ImageData;
        });
        const rightForegroundGetImageDataSpy = spyOn(service['rightForegroundContext'], 'getImageData').and.callFake(() => {
            return {} as ImageData;
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const leftForegroundPutImageDataSpy = spyOn(service['leftForegroundContext'], 'putImageData').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const rightForegroundPutImageDataSpy = spyOn(service['rightForegroundContext'], 'putImageData').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});

        service.swapForegrounds();
        expect(leftForegroundGetImageDataSpy).toHaveBeenCalled();
        expect(rightForegroundGetImageDataSpy).toHaveBeenCalled();
        expect(leftForegroundPutImageDataSpy).toHaveBeenCalled();
        expect(rightForegroundPutImageDataSpy).toHaveBeenCalled();
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
    });

    it('duplicateForeground called with leftCanvasPosition calls getImageData on leftForeground and putImage on right one and save state', () => {
        const rightContext = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        service['leftForegroundContext'] = contextStub;
        service['rightForegroundContext'] = rightContext;

        const leftForegroundGetImageDataSpy = spyOn(service['leftForegroundContext'], 'getImageData').and.callFake(() => {
            return {} as ImageData;
        });
        const rightForegroundGetImageDataSpy = spyOn(service['rightForegroundContext'], 'getImageData').and.callFake(() => {
            return {} as ImageData;
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const leftForegroundPutImageDataSpy = spyOn(service['leftForegroundContext'], 'putImageData').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const rightForegroundPutImageDataSpy = spyOn(service['rightForegroundContext'], 'putImageData').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});

        service.duplicateForeground(CanvasPosition.Left);
        expect(leftForegroundGetImageDataSpy).toHaveBeenCalled();
        expect(rightForegroundGetImageDataSpy).not.toHaveBeenCalled();
        expect(leftForegroundPutImageDataSpy).not.toHaveBeenCalled();
        expect(rightForegroundPutImageDataSpy).toHaveBeenCalled();
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
    });

    it('duplicateForeground called with rightCanvasPosition calls getImageData on rightForeground and putImage on left one and save state', () => {
        const rightContext = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        service['leftForegroundContext'] = contextStub;
        service['rightForegroundContext'] = rightContext;

        const leftForegroundGetImageDataSpy = spyOn(service['leftForegroundContext'], 'getImageData').and.callFake(() => {
            return {} as ImageData;
        });
        const rightForegroundGetImageDataSpy = spyOn(service['rightForegroundContext'], 'getImageData').and.callFake(() => {
            return {} as ImageData;
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const leftForegroundPutImageDataSpy = spyOn(service['leftForegroundContext'], 'putImageData').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const rightForegroundPutImageDataSpy = spyOn(service['rightForegroundContext'], 'putImageData').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});

        service.duplicateForeground(CanvasPosition.Right);
        expect(leftForegroundGetImageDataSpy).not.toHaveBeenCalled();
        expect(rightForegroundGetImageDataSpy).toHaveBeenCalled();
        expect(leftForegroundPutImageDataSpy).toHaveBeenCalled();
        expect(rightForegroundPutImageDataSpy).not.toHaveBeenCalled();
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
    });

    // TODO: undo-redo test / refactor

    // TODO : startForegroundOperation

    // TODO : disableDragging

    // TODO : stopForegroundOperation

    it('copyFrontCanvasToForeground called with leftCanvasPosition should call drawImage on leftForegroundContext and save state', () => {
        const rightContext = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        // const canvasStub = { width: 0, height: 0 } as HTMLCanvasElement;
        service['leftForegroundContext'] = contextStub;
        service['leftFrontContext'] = contextStub;
        service['rightForegroundContext'] = rightContext;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const leftForegroundDrawImageSpy = spyOn(service['leftForegroundContext'], 'drawImage').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const rightForegroundDrawImageSpy = spyOn(service['rightForegroundContext'], 'drawImage').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});

        service['copyFrontCanvasToForeground'](CanvasPosition.Left);
        expect(leftForegroundDrawImageSpy).toHaveBeenCalled();
        expect(rightForegroundDrawImageSpy).not.toHaveBeenCalled();
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
    });

    it('copyFrontCanvasToForeground called with rightCanvasPosition should call drawImage on leftForegroundContext and save state', () => {
        const leftContextStub = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        // const canvasStub = { width: 0, height: 0 } as HTMLCanvasElement;
        service['rightForegroundContext'] = contextStub;
        service['rightFrontContext'] = contextStub;
        service['leftForegroundContext'] = leftContextStub;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const leftForegroundDrawImageSpy = spyOn(service['leftForegroundContext'], 'drawImage').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const rightForegroundDrawImageSpy = spyOn(service['rightForegroundContext'], 'drawImage').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});

        service['copyFrontCanvasToForeground'](CanvasPosition.Right);
        expect(leftForegroundDrawImageSpy).not.toHaveBeenCalled();
        expect(rightForegroundDrawImageSpy).toHaveBeenCalled();
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
    });
});
