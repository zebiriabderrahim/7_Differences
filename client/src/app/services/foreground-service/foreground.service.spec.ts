// Needed more lines for the tests
/* eslint-disable max-lines */
// needed to spy on private methods
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundCanvasElements } from '@app/interfaces/foreground-canvas-elements';
import { ForegroundsState } from '@app/interfaces/foregrounds-state';
import { DrawService } from '@app/services/draw-service/draw.service';
import { ForegroundService } from './foreground.service';

describe('ForegroundService', () => {
    let service: ForegroundService;
    let contextStub: CanvasRenderingContext2D;
    let mouseEventStub: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawService', [
            'isCurrentActionRectangle',
            'setActiveCanvasPosition',
            'setClickPosition',
            'startOperation',
            'isMouseDragged',
            'disableMouseDrag',
            'isOperationValid',
            'stopOperation',
            'setActiveContext',
        ]);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(ForegroundService);
        contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        mouseEventStub = new MouseEvent('click', { button: 0, clientX: 0, clientY: 0 });
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

    it('undoCanvasOperation should not call anything if the foregroundsStack is smaller than 1', () => {
        service['foregroundsStateStack'] = [];
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const redrawForegroundsSpy = spyOn<any>(service, 'redrawForegrounds').and.callFake(() => {});
        service.undoCanvasOperation();
        expect(redrawForegroundsSpy).not.toHaveBeenCalled();
    });

    it('undoCanvasOperation should call redrawForegrounds and foregroundStackPeek', () => {
        service['foregroundsStateStack'] = [{} as ForegroundsState, {} as ForegroundsState];
        service['undoneForegroundsStateStack'] = [];
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const redrawForegroundsSpy = spyOn<any>(service, 'redrawForegrounds').and.callFake(() => {});
        service.undoCanvasOperation();
        expect(redrawForegroundsSpy).toHaveBeenCalled();
    });

    it('redoCanvasOperation should not call redrawForegrounds if the undoneForegroundsStateStack is empty', () => {
        service['undoneForegroundsStateStack'] = [];
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const redrawForegroundsSpy = spyOn<any>(service, 'redrawForegrounds').and.callFake(() => {});
        service.redoCanvasOperation();
        expect(redrawForegroundsSpy).not.toHaveBeenCalled();
    });

    it('redoCanvasOperation should call redrawForegrounds', () => {
        service['undoneForegroundsStateStack'] = [{} as ForegroundsState];
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const redrawForegroundsSpy = spyOn<any>(service, 'redrawForegrounds').and.callFake(() => {});
        service.redoCanvasOperation();
        expect(redrawForegroundsSpy).toHaveBeenCalled();
    });

    it('startForegroundOperation should reset the undoneForegroundsStateStack', () => {
        service['undoneForegroundsStateStack'] = [{} as ForegroundsState];
        service['foregroundsStateStack'] = [{} as ForegroundsState];
        service.startForegroundOperation(CanvasPosition.Left, mouseEventStub);
        expect(service['undoneForegroundsStateStack']).toEqual([]);
    });

    it('startForegroundOperation should push the return value of getForegroundsState in foregroundStateStack if empty', () => {
        const mockForegroundsState = {} as ForegroundsState;
        service['undoneForegroundsStateStack'] = [{} as ForegroundsState];
        service['foregroundsStateStack'] = [];
        const getForegroundsStateSpy = spyOn<any>(service, 'getForegroundsState').and.callFake(() => {
            return mockForegroundsState;
        });
        expect(service['foregroundsStateStack']).toEqual([]);
        service.startForegroundOperation(CanvasPosition.Left, mouseEventStub);
        expect(getForegroundsStateSpy).toHaveBeenCalled();
        expect(service['foregroundsStateStack']).toEqual([service['getForegroundsState']()]);
    });

    it('startForegroundOperation should call drawService Operations and setActiveContext', () => {
        service['undoneForegroundsStateStack'] = [{} as ForegroundsState];
        service['foregroundsStateStack'] = [{} as ForegroundsState];
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const setActiveContextSpy = spyOn<any>(service, 'setActiveContext').and.callFake(() => {});
        service.startForegroundOperation(CanvasPosition.Left, mouseEventStub);
        expect(setActiveContextSpy).toHaveBeenCalled();
        expect(drawServiceSpy.setActiveCanvasPosition).toHaveBeenCalled();
        expect(drawServiceSpy.setClickPosition).toHaveBeenCalled();
        expect(drawServiceSpy.startOperation).toHaveBeenCalled();
    });

    it('startForegroundOperation should set foregrounds contexts globalComposite to source-over', () => {
        const rightContext = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        service['leftForegroundContext'] = contextStub;
        service['rightForegroundContext'] = rightContext;
        service['undoneForegroundsStateStack'] = [{} as ForegroundsState];
        service['foregroundsStateStack'] = [{} as ForegroundsState];
        drawServiceSpy.isCurrentActionRectangle.and.returnValue(true);

        service['leftForegroundContext'].globalCompositeOperation = 'destination-out';
        service['rightForegroundContext'].globalCompositeOperation = 'destination-out';

        service.startForegroundOperation(CanvasPosition.Left, mouseEventStub);
        expect(service['leftForegroundContext'].globalCompositeOperation).toEqual('source-over');
        expect(service['rightForegroundContext'].globalCompositeOperation).toEqual('source-over');
    });

    it('disableDragging should not call disableMouseDrag and saveCurrentForegroundsState if drawService.isMouseDragged return false', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});
        drawServiceSpy.isMouseDragged.and.returnValue(false);
        service.disableDragging();
        expect(drawServiceSpy.disableMouseDrag).not.toHaveBeenCalled();
        expect(saveCurrentForegroundsStateSpy).not.toHaveBeenCalled();
    });

    it('disableDragging should call disableMouseDrag and saveCurrentForegroundsState if drawService.isMouseDragged return true', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});
        drawServiceSpy.isMouseDragged.and.returnValue(true);
        service.disableDragging();
        expect(drawServiceSpy.disableMouseDrag).toHaveBeenCalled();
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
    });

    it('stopForegroundOperation should not call drawService.stopOperation if drawService.isOperationValid returns false', () => {
        drawServiceSpy.isOperationValid.and.returnValue(false);
        service.stopForegroundOperation(CanvasPosition.Left, mouseEventStub);
        expect(drawServiceSpy.stopOperation).not.toHaveBeenCalled();
    });

    it('stopForegroundOperation should call drawService.stopOperation, saveCanvas if drawService.isOperationValid is true and not rectangle', () => {
        drawServiceSpy.isOperationValid.and.returnValue(true);
        drawServiceSpy.isCurrentActionRectangle.and.returnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const copyFrontCanvasToForegroundSpy = spyOn<any>(service, 'copyFrontCanvasToForeground').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const resetFrontCanvasContextSpy = spyOn<any>(service, 'resetFrontCanvasContext').and.callFake(() => {});
        service.stopForegroundOperation(CanvasPosition.Left, mouseEventStub);
        expect(drawServiceSpy.stopOperation).toHaveBeenCalled();
        expect(saveCurrentForegroundsStateSpy).toHaveBeenCalled();
        expect(copyFrontCanvasToForegroundSpy).not.toHaveBeenCalled();
        expect(resetFrontCanvasContextSpy).not.toHaveBeenCalled();
    });

    // it('stopForegroundOperation should call drawService.stopOperation, saveCanvas if drawService.isOperationValid is true and rectangle', () => {
    //     drawServiceSpy.isOperationValid.and.returnValue(true);
    //     drawServiceSpy.isCurrentActionRectangle.and.returnValue(true);
    //     // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
    //     const saveCurrentForegroundsStateSpy = spyOn<any>(service, 'saveCurrentForegroundsState').and.callFake(() => {});
    //     // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
    //     const copyFrontCanvasToForegroundSpy = spyOn<any>(service, 'copyFrontCanvasToForeground').and.callFake(() => {});
    //     // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
    //     const resetFrontCanvasContextSpy = spyOn<any>(service, 'resetFrontCanvasContext').and.callFake(() => {});
    //     service.stopForegroundOperation(CanvasPosition.Left, mouseEventStub);
    //     expect(drawServiceSpy.stopOperation).toHaveBeenCalled();
    //     expect(saveCurrentForegroundsStateSpy).not.toHaveBeenCalled();
    //     expect(copyFrontCanvasToForegroundSpy).toHaveBeenCalled();
    //     expect(resetFrontCanvasContextSpy).toHaveBeenCalled();
    // });

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

    it('setActiveContext called with leftPosition should call drawService.setActiveContext with leftFrontContext if action is Rectangle', () => {
        service['leftFrontContext'] = contextStub;
        drawServiceSpy.isCurrentActionRectangle.and.returnValue(true);
        service['setActiveContext'](CanvasPosition.Left);
        expect(drawServiceSpy.setActiveContext).toHaveBeenCalledOnceWith(service['leftFrontContext']);
    });

    it('setActiveContext called with leftPosition should call drawService.setActiveContext with leftForeground if action is not Rectangle', () => {
        service['leftForegroundContext'] = contextStub;
        drawServiceSpy.isCurrentActionRectangle.and.returnValue(false);
        service['setActiveContext'](CanvasPosition.Left);
        expect(drawServiceSpy.setActiveContext).toHaveBeenCalledOnceWith(service['leftForegroundContext']);
    });

    it('setActiveContext called with rightPosition should call drawService.setActiveContext with rightFrontContext if action is Rectangle', () => {
        service['rightFrontContext'] = contextStub;
        drawServiceSpy.isCurrentActionRectangle.and.returnValue(true);
        service['setActiveContext'](CanvasPosition.Right);
        expect(drawServiceSpy.setActiveContext).toHaveBeenCalledOnceWith(service['rightFrontContext']);
    });

    it('setActiveContext called with rightPosition should call drawService.setActiveContext with rightForeground if action is not Rectangle', () => {
        service['rightForegroundContext'] = contextStub;
        drawServiceSpy.isCurrentActionRectangle.and.returnValue(false);
        service['setActiveContext'](CanvasPosition.Right);
        expect(drawServiceSpy.setActiveContext).toHaveBeenCalledOnceWith(service['rightForegroundContext']);
    });

    it('redrawForegrounds should call resetForeground and putImageData on both foregroundContexts', () => {
        const leftContextStub = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        service['leftForegroundContext'] = leftContextStub;
        service['rightForegroundContext'] = contextStub;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const leftForegroundPutImageDataSpy = spyOn(service['leftForegroundContext'], 'putImageData').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const rightForegroundPutImageDataSpy = spyOn(service['rightForegroundContext'], 'putImageData').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const resetForegroundSpy = spyOn(service, 'resetForeground').and.callFake(() => {});
        const foregroundStatesStub = {} as ForegroundsState;
        service['redrawForegrounds'](foregroundStatesStub);
        expect(leftForegroundPutImageDataSpy).toHaveBeenCalled();
        expect(rightForegroundPutImageDataSpy).toHaveBeenCalled();
        expect(resetForegroundSpy).toHaveBeenCalledOnceWith(CanvasPosition.Both);
    });

    it('getForegroundsState should call getImageData on both foregroundContexts and return them', () => {
        const rightContext = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        service['leftForegroundContext'] = contextStub;
        service['rightForegroundContext'] = rightContext;
        const mockLeftImageData = {} as ImageData;
        const mockRightImageData = {} as ImageData;

        const leftForegroundGetImageDataSpy = spyOn(service['leftForegroundContext'], 'getImageData').and.callFake(() => {
            return mockLeftImageData;
        });
        const rightForegroundGetImageDataSpy = spyOn(service['rightForegroundContext'], 'getImageData').and.callFake(() => {
            return mockRightImageData;
        });
        expect(service['getForegroundsState']()).toEqual({ left: mockLeftImageData, right: mockRightImageData });
        expect(leftForegroundGetImageDataSpy).toHaveBeenCalled();
        expect(rightForegroundGetImageDataSpy).toHaveBeenCalled();
    });

    it('saveCurrentForegroundsState should call getForegroundsState and push the result to foregroundsStates', () => {
        const foregroundsStateStub = {} as ForegroundsState;
        const foregroundsStateStackStub = [] as ForegroundsState[];
        service['foregroundsStateStack'] = foregroundsStateStackStub;
        const getForegroundsStateSpy = spyOn<any>(service, 'getForegroundsState').and.callFake(() => {
            return foregroundsStateStub;
        });
        expect(service['foregroundsStateStack']).toEqual([]);
        service['saveCurrentForegroundsState']();
        expect(getForegroundsStateSpy).toHaveBeenCalled();
        expect(service['foregroundsStateStack']).toEqual([foregroundsStateStub]);
    });

    it('resetCanvasContext should call clearRect the context its called with', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const clearRectSpy = spyOn(contextStub, 'clearRect').and.callFake(() => {});
        service['resetCanvasContext'](contextStub);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('resetFrontCanvasContext called with leftPosition should call resetCanvasContext with leftFrontContext', () => {
        service['leftFrontContext'] = contextStub;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const resetCanvasContextSpy = spyOn<any>(service, 'resetCanvasContext').and.callFake(() => {});
        service['resetFrontCanvasContext'](CanvasPosition.Left);
        expect(resetCanvasContextSpy).toHaveBeenCalledOnceWith(service['leftFrontContext']);
    });

    it('resetFrontCanvasContext called with rightPosition should call resetCanvasContext with rightFrontContext', () => {
        service['rightFrontContext'] = contextStub;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const resetCanvasContextSpy = spyOn<any>(service, 'resetCanvasContext').and.callFake(() => {});
        service['resetFrontCanvasContext'](CanvasPosition.Right);
        expect(resetCanvasContextSpy).toHaveBeenCalledOnceWith(service['rightFrontContext']);
    });
});
