import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { ImageService } from '@app/services/image-service/image.service';
import { CreationGameDialogComponent } from './creation-game-dialog.component';

describe('CreationGameDialogComponent', () => {
    let component: CreationGameDialogComponent;
    let fixture: ComponentFixture<CreationGameDialogComponent>;
    let imageService: ImageService;
    let differenceService: DifferenceService;
    let dialogRef: MatDialogRef<CreationGameDialogComponent, unknown>;
    let contextStub: CanvasRenderingContext2D;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [CreationGameDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        dialogRef = TestBed.inject(MatDialogRef<CreationGameDialogComponent, unknown>);
        imageService = TestBed.inject(ImageService);
        differenceService = TestBed.inject(DifferenceService);
        contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        imageService.leftBackgroundContext = contextStub;
        imageService.rightBackgroundContext = contextStub;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the gameNameForm', () => {
        expect(component.gameNameForm instanceof FormGroup).toBeTruthy();
        expect(component.gameNameForm.controls.name instanceof FormControl).toBeTruthy();
    });

    it('gameNameForm should be enabled isNumberOfDifferencesValid is true', () => {
        differenceService.differencePackages = [
            [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ],
            [
                { x: 50, y: 60 },
                { x: 70, y: 80 },
            ],
            [
                { x: 90, y: 100 },
                { x: 110, y: 120 },
            ],
        ];
        expect(component.gameNameForm.enabled).toBeTruthy();
    });

    it('gameNameForm should be disabled if isNumberOfDifferencesValid is false', () => {
        differenceService.differencePackages = [
            [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ],
        ];
        expect(component.gameNameForm.disabled).toBeFalsy();
    });

    it('should close the dialog onNoClick', () => {
        component.onNoClick();
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should emit the game name and close the dialog if the form is valid', () => {
        component.gameNameForm = new FormGroup({ name: new FormControl('name') });
        const spy = spyOn(component.gameNameEvent, 'emit');
        component.submitForm();
        expect(spy).toHaveBeenCalledWith('name');
        expect(dialogRef.close).toHaveBeenCalledWith();
    });

    it('should not emit the game name or close the dialog if the form is invalid', () => {
        const spy = spyOn(component.gameNameEvent, 'emit');
        component.submitForm();
        expect(spy).not.toHaveBeenCalled();
        expect(dialogRef.close).not.toHaveBeenCalled();
    });
});
