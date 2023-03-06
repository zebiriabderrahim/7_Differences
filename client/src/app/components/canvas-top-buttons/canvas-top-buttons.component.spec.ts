import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DrawService } from '@app/services/draw-service/draw.service';
import { CanvasTopButtonsComponent } from './canvas-top-buttons.component';

describe('CanvasTopButtonsComponent', () => {
    let component: CanvasTopButtonsComponent;
    let fixture: ComponentFixture<CanvasTopButtonsComponent>;
    let drawService: DrawService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatButtonToggleModule,
                MatIconModule,
                MatFormFieldModule,
                MatSelectModule,
                FormsModule,
                HttpClientModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
            ],
            declarations: [CanvasTopButtonsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasTopButtonsComponent);
        drawService = TestBed.inject(DrawService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call resetForeground when reset button is clicked', () => {
        const drawServiceResetForegroundSpy = spyOn(drawService, 'resetForeground');
        const resetButton = fixture.nativeElement.querySelector('button~button');
        resetButton.click();
        fixture.detectChanges();
        expect(drawServiceResetForegroundSpy).toHaveBeenCalledWith(component.position);
    });

    // it('should return the correct operation details for the Pencil action', () => {
    //     const canvas = new Canvas();
    //     canvas.selectedCanvasAction = CanvasAction.Pencil;
    //     canvas.pencilDiameter = 5;
    //     canvas.position = { x: 10, y: 20 };
    //     canvas.drawColor = 'blue';
    //     const result = canvas.getOperationDetails();
    //     expect(result).toEqual({
    //         action: CanvasAction.Pencil,
    //         position: { x: 10, y: 20 },
    //         color: 'blue',
    //         width: 5,
    //     });
    // });

    // it('should return the correct operation details for the Eraser action', () => {
    //     component.selectedCanvasAction = CanvasAction.Eraser;
    //     component.eraserLength = 10;
    //     component.position = { x: 30, y: 40 };
    //     component.drawColor = 'white';
    //     const result = component.getOperationDetails();
    //     expect(result).toEqual({
    //         action: CanvasAction.Eraser,
    //         position: { x: 30, y: 40 },
    //         color: 'white',
    //         width: 10,
    //     });
    // });
});
