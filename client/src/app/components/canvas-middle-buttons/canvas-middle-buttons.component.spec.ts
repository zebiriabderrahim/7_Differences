import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';
import { CanvasMiddleButtonsComponent } from './canvas-middle-buttons.component';

describe('CanvasMiddleButtonsComponent', () => {
    let component: CanvasMiddleButtonsComponent;
    let fixture: ComponentFixture<CanvasMiddleButtonsComponent>;
    let foregroundServiceSpy: jasmine.SpyObj<ForegroundService>;

    beforeEach(async () => {
        foregroundServiceSpy = jasmine.createSpyObj('ForegroundService', [
            'swapForegrounds',
            'duplicateForeground',
            'undoCanvasOperation',
            'redoCanvasOperation',
        ]);
        await TestBed.configureTestingModule({
            declarations: [CanvasMiddleButtonsComponent, MatIcon],
            providers: [{ provide: ForegroundService, useValue: foregroundServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasMiddleButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call duplicateForeground with CanvasPosition.Right when duplicateRightForeground button is clicked', () => {
        const duplicateRightForegroundSpy = spyOn(component, 'duplicateRightForeground').and.callThrough();
        const duplicateRightForegroundButton = fixture.nativeElement.querySelector('#buttons button:first-child');
        expect(duplicateRightForegroundSpy).not.toHaveBeenCalled();
        duplicateRightForegroundButton.click();
        fixture.detectChanges();
        expect(duplicateRightForegroundSpy).toHaveBeenCalled();
        expect(foregroundServiceSpy.duplicateForeground).toHaveBeenCalledOnceWith(CanvasPosition.Right);
    });

    it('should call duplicateForeground with CanvasPosition.Left when duplicateLeftForeground button is clicked', () => {
        const duplicateLeftForegroundSpy = spyOn(component, 'duplicateLeftForeground').and.callThrough();
        const duplicateLeftForegroundButton = fixture.nativeElement.querySelector('#buttons button:nth-child(3)');
        expect(duplicateLeftForegroundSpy).not.toHaveBeenCalled();
        duplicateLeftForegroundButton.click();
        fixture.detectChanges();
        expect(duplicateLeftForegroundSpy).toHaveBeenCalled();
        expect(foregroundServiceSpy.duplicateForeground).toHaveBeenCalledOnceWith(CanvasPosition.Left);
    });

    it('should call swapForegrounds when swapForegrounds button is clicked', () => {
        const swapForegroundsSpy = spyOn(component, 'swapForegrounds').and.callThrough();
        const swapForegroundsButton = fixture.nativeElement.querySelector('#buttons button:nth-child(2)');
        expect(swapForegroundsSpy).not.toHaveBeenCalled();
        swapForegroundsButton.click();
        fixture.detectChanges();
        expect(swapForegroundsSpy).toHaveBeenCalled();
        expect(foregroundServiceSpy.swapForegrounds).toHaveBeenCalled();
    });

    it('should call undoCanvasOperation when undoCanvasOperation button is clicked', () => {
        const undoCanvasOperationSpy = spyOn(component, 'undoCanvasOperation').and.callThrough();
        const undoButton = fixture.nativeElement.querySelector('#undo-redo-buttons button:first-child');
        expect(undoCanvasOperationSpy).not.toHaveBeenCalled();
        undoButton.click();
        fixture.detectChanges();
        expect(undoCanvasOperationSpy).toHaveBeenCalled();
        expect(foregroundServiceSpy.undoCanvasOperation).toHaveBeenCalled();
    });

    it('should call redoCanvasOperation when redoCanvasOperation button is clicked', () => {
        const redoCanvasOperationSpy = spyOn(component, 'redoCanvasOperation').and.callThrough();
        const redoButton = fixture.nativeElement.querySelector('#undo-redo-buttons button:last-child');
        expect(redoCanvasOperationSpy).not.toHaveBeenCalled();
        redoButton.click();
        fixture.detectChanges();
        expect(redoCanvasOperationSpy).toHaveBeenCalled();
        expect(foregroundServiceSpy.redoCanvasOperation).toHaveBeenCalled();
    });
});
