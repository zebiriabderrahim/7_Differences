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
});
