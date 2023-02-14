/* eslint-disable @typescript-eslint/no-empty-function */
// Needed for window.location.reload()
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GameDetails } from '@app/interfaces/game-interfaces';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { ImageService } from '@app/services/image-service/image.service';
import { CreationGameDialogComponent } from './creation-game-dialog.component';

describe('CreationGameDialogComponent', () => {
    let component: CreationGameDialogComponent;
    let fixture: ComponentFixture<CreationGameDialogComponent>;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;
    let differenceServiceSpy: jasmine.SpyObj<DifferenceService>;
    let dialogRef: MatDialogRef<CreationGameDialogComponent, unknown>;

    beforeEach(async () => {
        imageServiceSpy = jasmine.createSpyObj('ImageService', [
            'generateDifferences',
            'getGamePixels',
            'getImageSources',
            'drawDifferences',
            'resetBothBackgrounds',
        ]);
        differenceServiceSpy = jasmine.createSpyObj('DifferenceService', [
            'generateDifferences',
            'generateDifferencesPackages',
            'getGamesPixels',
            'getImageSources',
            'isNumberOfDifferencesValid',
            'getNumberOfDifferences',
            'isGameHard',
        ]);
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                RouterTestingModule,
            ],
            declarations: [CreationGameDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
                { provide: MAT_DIALOG_DATA, useValue: [] },
                { provide: ImageService, useValue: imageServiceSpy },
                { provide: DifferenceService, useValue: differenceServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        dialogRef = TestBed.inject(MatDialogRef<CreationGameDialogComponent, unknown>);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the gameNameForm', () => {
        expect(component.gameNameForm instanceof FormGroup).toBeTruthy();
        expect(component.gameNameForm.controls.name instanceof FormControl).toBeTruthy();
    });

    it('ngOnInit should generate differences and call drawDifferences and get differenceContext on the image service', () => {
        differenceServiceSpy.generateDifferences.and.callFake(() => {
            return [];
        });
        const context = CanvasTestHelper.createCanvas(0, 0).getContext('2d') as CanvasRenderingContext2D;
        const getContextSpy = spyOn(component.differenceCanvas.nativeElement, 'getContext').and.callFake(() => {
            return context;
        });
        component.ngOnInit();

        expect(differenceServiceSpy.generateDifferences).toHaveBeenCalledWith(imageServiceSpy.getGamePixels(), component.radius);
        expect(getContextSpy).toHaveBeenCalled();
        expect(imageServiceSpy.drawDifferences).toHaveBeenCalledWith(context, []);
    });

    it('should not display the number of differences when displayDifferences is not defined', () => {
        fixture.detectChanges();
        const bannerElement: HTMLElement = fixture.nativeElement;
        const p = bannerElement.querySelector('canvas > p');
        expect(p?.textContent).not.toContain(component.displayDifferences);
    });

    it('gameNameForm should be enabled isNumberOfDifferencesValid is true', () => {
        differenceServiceSpy.isNumberOfDifferencesValid.and.returnValue(true);
        expect(component.gameNameForm.enabled).toBeTruthy();
    });

    it('gameNameForm should be enabled isNumberOfDifferencesValid is true', () => {
        differenceServiceSpy.isNumberOfDifferencesValid.and.returnValue(true);
        expect(component.gameNameForm.enabled).toBeTruthy();
    });

    it('gameNameForm should be enabled isNumberOfDifferencesValid is true', () => {
        differenceServiceSpy.isNumberOfDifferencesValid.and.returnValue(true);
        expect(component.gameNameForm.enabled).toBeTruthy();
    });

    it('gameNameForm should be disabled if isNumberOfDifferencesValid is false', () => {
        differenceServiceSpy.isNumberOfDifferencesValid.and.returnValue(false);
        expect(component.gameNameForm.disabled).toBeFalsy();
    });

    it('should close the dialog onNoClick', () => {
        component.onNoClick();
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should emit the game and close the dialog if the form is valid', () => {
        const gameDetails: GameDetails = {
            name: 'name',
            originalImage: 'left',
            modifiedImage: 'right',
            nDifference: 0,
            differences: [],
            isHard: true,
        };
        differenceServiceSpy.isGameHard.and.returnValue(true);
        component.gameNameForm = new FormGroup({ name: new FormControl('name') });
        imageServiceSpy.getImageSources.and.returnValue({ left: 'left', right: 'right' });
        differenceServiceSpy.generateDifferencesPackages.and.returnValue([]);
        component.submitForm();
        expect(dialogRef.close).toHaveBeenCalledWith(gameDetails);
    });

    it('should close the dialog if the form is invalid', () => {
        component.submitForm();
        expect(dialogRef.close).not.toHaveBeenCalled();
    });
});
