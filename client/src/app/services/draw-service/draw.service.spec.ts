// Needed to test private methods
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
import { Coordinate } from '@common/coordinate';
import { DrawService } from './draw.service';

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

    it('getActiveCanvasPosition should return activeCanvasPosition', () => {
        service['activeCanvasPosition'] = CanvasPosition.Left;
        expect(service.getActiveCanvasPosition()).toEqual(service['activeCanvasPosition']);
    });

    it('mouseIsOutOfCanvas should set isMouseOutOfCanvas to true', () => {
        service['isMouseOutOfCanvas'] = false;
        service.mouseIsOutOfCanvas();
        expect(service['isMouseOutOfCanvas']).toBeTruthy();
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
        expect(service.isCurrentActionRectangle()).toBeTruthy();
    });

    it('isCurrentActionRectangle should return false if currentAction is not rectangle', () => {
        service['currentAction'] = CanvasAction.Pencil;
        expect(service.isCurrentActionRectangle()).toBeFalse();
    });

    it('isMouseDragged should return true if mouse is being dragged', () => {
        service['isMouseBeingDragged'] = true;
        expect(service.isMouseDragged()).toBeTruthy();
    });

    it('isOperationValid should return true if mouse is being dragged and mouse is not out of canvas', () => {
        service['isMouseBeingDragged'] = true;
        service['activeCanvasPosition'] = CanvasPosition.Left;
        service.isOperationValid(CanvasPosition.Left);
        expect(service.isOperationValid(CanvasPosition.Left)).toBeTruthy();
    });

    it('isOperationValid should return false if mouse is not being dragged', () => {
        service['isMouseBeingDragged'] = false;
        expect(service.isOperationValid(CanvasPosition.Left)).toBeFalsy();
    });

    it('isOperationValid should return false if mouse is out of canvas', () => {
        service['isMouseBeingDragged'] = true;
        service['activeCanvasPosition'] = CanvasPosition.Left;
        expect(service.isOperationValid(CanvasPosition.Right)).toBeFalsy();
    });

    it('disableMouseDrag should set isMouseBeingDragged to false if its true', () => {
        service['isMouseBeingDragged'] = true;
        service.disableMouseDrag();
        expect(service['isMouseBeingDragged']).toBeFalsy();
    });

    it('disableMouseDrag should not change isMouseBeingDragged if its already false', () => {
        service['isMouseBeingDragged'] = false;
        service.disableMouseDrag();
        expect(service['isMouseBeingDragged']).toBeFalsy();
    });

    it('startOperation should set isMouseBeingDragged to true, call setCanvasOperationStyle', () => {
        service['isMouseBeingDragged'] = false;
        service['activeContext'] = contextStub;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        spyOn<any>(service, 'drawLine').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const setCanvasOperationStyleSpy = spyOn<any>(service, 'setCanvasOperationStyle').and.callFake(() => {});
        service.startOperation();
        expect(service['isMouseBeingDragged']).toBeTruthy();
        expect(setCanvasOperationStyleSpy).toHaveBeenCalled();
    });

    it('startOperation should call beginPath and drawLine if isCurrentActionRectangle is false', () => {
        service['activeContext'] = contextStub;
        const beginPathSpy = spyOn(contextStub, 'beginPath');
        spyOn(service, 'isCurrentActionRectangle').and.callFake(() => false);

        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const drawLineSpy = spyOn<any>(service, 'drawLine').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        spyOn<any>(service, 'setCanvasOperationStyle').and.callFake(() => {});

        service.startOperation();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(beginPathSpy).toHaveBeenCalled();
    });

    it('startOperation should should set recTangleTopCorner to click and drawLine is isCurrentActionRectangle is true', () => {
        const fakeCoordinate: Coordinate = { x: 33, y: 33 };
        service['clickPosition'] = fakeCoordinate;
        service['activeContext'] = contextStub;
        spyOn(service, 'isCurrentActionRectangle').and.callFake(() => true);

        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        spyOn<any>(service, 'setCanvasOperationStyle').and.callFake(() => {});
        expect(service['rectangleTopCorner']).not.toBe(service['clickPosition']);
        service.startOperation();
        expect(service['rectangleTopCorner']).toBe(service['clickPosition']);
    });

    it('continueCanvasOperation should only call setClickPosition is the operation is invalid', () => {
        service['activeContext'] = contextStub;
        const mockMouseEvent = new MouseEvent('click', { button: 0, clientX: 0, clientY: 0 });
        const closePathSpy = spyOn(contextStub, 'closePath');
        const beginPathSpy = spyOn(contextStub, 'beginPath');
        const drawCanvasOperationSpy = spyOn<any>(service, 'drawCanvasOperation');
        const setClickPositionSpy = spyOn(service, 'setClickPosition');
        spyOn(service, 'isOperationValid').and.callFake(() => false);
        service.continueCanvasOperation(CanvasPosition.Left, mockMouseEvent);
        expect(setClickPositionSpy).toHaveBeenCalled();
        expect(drawCanvasOperationSpy).not.toHaveBeenCalled();
        expect(beginPathSpy).not.toHaveBeenCalled();
        expect(closePathSpy).not.toHaveBeenCalled();
    });

    it('continueCanvasOperation should only call drawCanvasOperation is the operation is valid', () => {
        service['activeContext'] = contextStub;
        service['isMouseOutOfCanvas'] = false;
        const mockMouseEvent = new MouseEvent('click', { button: 0, clientX: 0, clientY: 0 });
        const closePathSpy = spyOn(contextStub, 'closePath');
        const beginPathSpy = spyOn(contextStub, 'beginPath');
        const drawCanvasOperationSpy = spyOn<any>(service, 'drawCanvasOperation');
        const setClickPositionSpy = spyOn(service, 'setClickPosition');
        spyOn(service, 'isOperationValid').and.callFake(() => true);
        service.continueCanvasOperation(CanvasPosition.Left, mockMouseEvent);
        expect(setClickPositionSpy).toHaveBeenCalled();
        expect(drawCanvasOperationSpy).toHaveBeenCalled();
        expect(beginPathSpy).not.toHaveBeenCalled();
        expect(closePathSpy).not.toHaveBeenCalled();
    });

    it('continueCanvasOperation should only call drawCanvasOperation and change path is the operation is valid', () => {
        service['activeContext'] = contextStub;
        service['isMouseOutOfCanvas'] = true;
        const mockMouseEvent = new MouseEvent('click', { button: 0, clientX: 0, clientY: 0 });
        const closePathSpy = spyOn(contextStub, 'closePath');
        const beginPathSpy = spyOn(contextStub, 'beginPath');
        const drawCanvasOperationSpy = spyOn<any>(service, 'drawCanvasOperation');
        const setClickPositionSpy = spyOn(service, 'setClickPosition');
        spyOn(service, 'isOperationValid').and.callFake(() => true);
        service.continueCanvasOperation(CanvasPosition.Left, mockMouseEvent);
        expect(setClickPositionSpy).toHaveBeenCalled();
        expect(drawCanvasOperationSpy).toHaveBeenCalled();
        expect(beginPathSpy).toHaveBeenCalled();
        expect(closePathSpy).toHaveBeenCalled();
    });

    it('stopOperation should call disableMouseDrag and drawCanvasOperation', () => {
        const disableMouseDragSpy = spyOn<any>(service, 'disableMouseDrag');
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const drawCanvasOperationSpy = spyOn<any>(service, 'drawCanvasOperation').and.callFake(() => {});
        service.stopOperation();
        expect(drawCanvasOperationSpy).toHaveBeenCalled();
        expect(disableMouseDragSpy).toHaveBeenCalled();
    });

    it('setSquareMode should not set isSquareModeOn to value if mouse is not dragged', () => {
        const mockSquareMode = true;
        service['isMouseBeingDragged'] = false;
        expect(service['isSquareModeOn']).not.toBe(mockSquareMode);
        service.setSquareMode(mockSquareMode);
        expect(service['isSquareModeOn']).not.toBe(mockSquareMode);
    });

    it('drawCanvasOperation should call drawRectangle if isCurrentActionRectangle is true', () => {
        spyOn(service, 'isCurrentActionRectangle').and.callFake(() => true);
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const drawLineSpy = spyOn<any>(service, 'drawLine').and.callFake(() => {});
        service.stopOperation();
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('drawCanvasOperation should call drawLine if isCurrentActionRectangle is false', () => {
        spyOn(service, 'isCurrentActionRectangle').and.callFake(() => false);
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const drawLineSpy = spyOn<any>(service, 'drawLine').and.callFake(() => {});
        service.stopOperation();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('setSquareMode should not set isSquareModeOn to value if not in rectangle action', () => {
        const mockSquareMode = true;
        service['isMouseBeingDragged'] = true;
        spyOn(service, 'isCurrentActionRectangle').and.callFake(() => false);
        expect(service['isSquareModeOn']).not.toBe(mockSquareMode);
        service.setSquareMode(mockSquareMode);
        expect(service['isSquareModeOn']).not.toBe(mockSquareMode);
    });

    it('setSquareMode should call drawRectangle and set the squareMode if mouse is dragged in rectangle', () => {
        const mockSquareMode = true;
        service['isMouseBeingDragged'] = true;
        spyOn(service, 'isCurrentActionRectangle').and.callFake(() => true);

        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callFake(() => {});
        expect(service['isSquareModeOn']).not.toBe(mockSquareMode);
        service.setSquareMode(mockSquareMode);
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(service['isSquareModeOn']).toBe(mockSquareMode);
    });

    it('setCanvasOperationStyle should set composition to source-over and fillStyle to drawingColor if rectangle', () => {
        service['currentAction'] = CanvasAction.Rectangle;
        service['activeContext'] = contextStub;
        service['activeContext'].globalCompositeOperation = 'destination-over';
        service['drawingColor'] = '#ff0000';
        expect(service['activeContext'].globalCompositeOperation).not.toBe('source-over');
        expect(service['activeContext'].fillStyle).not.toBe(service['drawingColor']);
        service['setCanvasOperationStyle']();
        expect(service['activeContext'].globalCompositeOperation).toBe('source-over');
        expect(service['activeContext'].fillStyle).toBe(service['drawingColor']);
    });

    it('setCanvasOperationStyle should set source-over, round, color, round and pencilWidth if pencil', () => {
        service['currentAction'] = CanvasAction.Pencil;
        service['activeContext'] = contextStub;
        service['activeContext'].globalCompositeOperation = 'destination-over';
        service['activeContext'].lineCap = 'butt';
        service['activeContext'].lineJoin = 'bevel';
        service['drawingColor'] = '#ff0000';
        service['pencilWidth'] = 5;
        expect(service['activeContext'].globalCompositeOperation).not.toBe('source-over');
        expect(service['activeContext'].strokeStyle).not.toBe(service['drawingColor']);
        expect(service['activeContext'].lineCap).not.toBe('round');
        expect(service['activeContext'].lineWidth).not.toBe(service['pencilWidth']);
        expect(service['activeContext'].lineJoin).not.toBe('round');
        service['setCanvasOperationStyle']();
        expect(service['activeContext'].lineJoin).toBe('round');
        expect(service['activeContext'].lineWidth).toBe(service['pencilWidth']);
        expect(service['activeContext'].lineCap).toBe('round');
        expect(service['activeContext'].globalCompositeOperation).toBe('source-over');
        expect(service['activeContext'].strokeStyle).toBe(service['drawingColor']);
    });

    it('setCanvasOperationStyle should set destination-out, round, color, square and eraserWidth if eraser', () => {
        service['currentAction'] = CanvasAction.Eraser;
        service['activeContext'] = contextStub;
        service['activeContext'].globalCompositeOperation = 'destination-over';
        service['activeContext'].lineCap = 'butt';
        service['activeContext'].lineJoin = 'bevel';
        service['drawingColor'] = '#ff0000';
        service['eraserLength'] = 5;
        expect(service['activeContext'].globalCompositeOperation).not.toBe('destination-out');
        expect(service['activeContext'].strokeStyle).not.toBe(service['drawingColor']);
        expect(service['activeContext'].lineCap).not.toBe('square');
        expect(service['activeContext'].lineWidth).not.toBe(service['eraserLength']);
        expect(service['activeContext'].lineJoin).not.toBe('round');
        service['setCanvasOperationStyle']();
        expect(service['activeContext'].lineJoin).toBe('round');
        expect(service['activeContext'].lineWidth).toBe(service['eraserLength']);
        expect(service['activeContext'].lineCap).toBe('square');
        expect(service['activeContext'].globalCompositeOperation).toBe('destination-out');
        expect(service['activeContext'].strokeStyle).toBe(service['drawingColor']);
    });

    it('drawRectangle should call clearRect and fillRect on activeContext', () => {
        const fakeCoordinate: Coordinate = { x: 33, y: 33 };
        service['clickPosition'] = fakeCoordinate;
        service['rectangleTopCorner'] = fakeCoordinate;
        service['isSquareModeOn'] = false;
        service['activeContext'] = contextStub;
        const spyClearRect = spyOn(contextStub, 'clearRect');
        const spyFillRect = spyOn(contextStub, 'fillRect');
        service['drawRectangle']();
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyFillRect).toHaveBeenCalled();
    });

    it('drawRectangle should call fillRect with rectangle Height as its width if squareMode is On ', () => {
        const fakeCoordinate: Coordinate = { x: 33, y: 66 };
        const fakeRectangleTopCorner: Coordinate = { x: 0, y: 0 };
        const rectangleWidth = fakeCoordinate.x - fakeRectangleTopCorner.x;

        service['clickPosition'] = fakeCoordinate;
        service['rectangleTopCorner'] = fakeRectangleTopCorner;
        service['isSquareModeOn'] = true;
        service['activeContext'] = contextStub;
        const spyFillRect = spyOn(contextStub, 'fillRect');
        service['drawRectangle']();
        expect(spyFillRect).toHaveBeenCalledOnceWith(fakeRectangleTopCorner.x, fakeRectangleTopCorner.y, rectangleWidth, rectangleWidth);
    });

    it('drawLine should call stroke and lineTo on activeContext', () => {
        const fakeCoordinate: Coordinate = { x: 33, y: 33 };
        service['clickPosition'] = fakeCoordinate;
        service['activeContext'] = contextStub;
        const spyStroke = spyOn(contextStub, 'stroke');
        const spyLineTo = spyOn(contextStub, 'lineTo');
        service['drawLine']();
        expect(spyStroke).toHaveBeenCalled();
        expect(spyLineTo).toHaveBeenCalled();
    });
});
