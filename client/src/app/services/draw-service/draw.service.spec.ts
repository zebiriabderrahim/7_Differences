import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
import { DrawService } from './draw.service';
import { Coordinate } from '@common/coordinate';

describe('DrawService', () => {
    let service: DrawService;
    let contextStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawService);
        contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseIsOutOfCanvas should set isMouseOutOfCanvas to false', () => {
        service['isMouseOutOfCanvas'] = true;
        service.mouseIsOutOfCanvas();
        expect(service['isMouseOutOfCanvas']).toBe(false);
    });

    it('setDrawingColor should set drawingColor to appropriate value', () => {
        const mockColor = 'white';
        expect(service['drawingColor']).not.toBe(mockColor);
        service.setDrawingColor(mockColor);
        expect(service['drawingColor']).toBe(mockColor);
    });

    it('setCanvasAction should set currentAction to appropriate value', () => {
        const mockCanvasAction = CanvasAction.Rectangle;
        expect(service['currentAction']).not.toBe(mockCanvasAction);
        service.setCanvasAction(mockCanvasAction);
        expect(service['currentAction']).toBe(mockCanvasAction);
    });

    it('setPencilWidth should set pencilWidth to appropriate value', () => {
        const mockWidth = 10;
        expect(service['pencilWidth']).not.toBe(mockWidth);
        service.setPencilWidth(mockWidth);
        expect(service['pencilWidth']).toBe(mockWidth);
    });

    it('setEraserLength should set eraserLength to appropriate value', () => {
        const mockWidth = 10;
        expect(service['eraserLength']).not.toBe(mockWidth);
        service.setEraserLength(mockWidth);
        expect(service['eraserLength']).toBe(mockWidth);
    });

    it('setActiveCanvasPosition should set activeCanvasPosition to appropriate value', () => {
        const mockCanvasPosition = CanvasPosition.Left;
        expect(service['activeCanvasPosition']).not.toBe(mockCanvasPosition);
        service.setActiveCanvasPosition(mockCanvasPosition);
        expect(service['activeCanvasPosition']).toBe(mockCanvasPosition);
    });

    it('setActiveContext should set activeContext to appropriate value', () => {
        const mockContext = contextStub;
        expect(service['activeContext']).not.toBe(mockContext);
        service.setActiveContext(mockContext);
        expect(service['activeContext']).toBe(mockContext);
    });

    it('setClickPosition should set clickPosition to appropriate value', () => {
        const mockMouseEvent = new MouseEvent('click', { button: 0, clientX: 0, clientY: 0 });
        const fakeCoordinate: Coordinate = { x: 33, y: 33 };
        service['clickPosition'] = fakeCoordinate;
        expect(service['clickPosition'].x).not.toBe(mockMouseEvent.offsetX);
        expect(service['clickPosition'].y).not.toBe(mockMouseEvent.offsetY);
        service.setClickPosition(mockMouseEvent);
        expect(service['clickPosition'].x).toBe(mockMouseEvent.offsetX);
        expect(service['clickPosition'].y).toBe(mockMouseEvent.offsetY);
    });

    it('isCurrentActionRectangle should return true if currentAction is rectangle', () => {
        service['currentAction'] = CanvasAction.Rectangle;
        expect(service.isCurrentActionRectangle()).toBeTrue();
    });

    it('isCurrentActionRectangle should return false if currentAction is not rectangle', () => {
        service['currentAction'] = CanvasAction.Pencil;
        expect(service.isCurrentActionRectangle()).toBeFalse();
    });

    // TODO : Mouse being dragged test
    // it('isMouseBeingDragged should return true if mouse is being dragged', () => {
    //     service['isMouseBeingDragged'] = true;
    //     expect(service.isMouseBeingDragged()).toBeTrue();
    // }

    // TODO : isOperationValid test

    it('disableMouseDrag should set isMouseBeingDragged to false if its true', () => {
        service['isMouseBeingDragged'] = true;
        service.disableMouseDrag();
        expect(service['isMouseBeingDragged']).toBeFalse();
    });

    it('disableMouseDrag should not change isMouseBeingDragged if its already false', () => {
        service['isMouseBeingDragged'] = false;
        service.disableMouseDrag();
        expect(service['isMouseBeingDragged']).toBeFalse();
    });
});
