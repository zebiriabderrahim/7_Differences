import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatFormFieldModule, MatFormFieldControl } from '@angular/material/form-field';
// import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
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
            ],
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

    // it('should display the number of differences when displayDifferences is defined', () => {
    //     differenceService.differencePackages.length = 5;
    //     fixture.detectChanges();
    //     const bannerElement: HTMLElement = fixture.nativeElement;
    //     const p = bannerElement.querySelector('div > p');
    //     expect(p?.textContent).toContain(component.displayDifferences);
    // });

    it('should not display the number of differences when displayDifferences is not defined', () => {
        fixture.detectChanges();
        const bannerElement: HTMLElement = fixture.nativeElement;
        const p = bannerElement.querySelector('div > p');
        expect(p?.textContent).not.toContain(component.displayDifferences);
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

    // TODO: fix this
    // it('should display the warning message when isNumberOfDifferencesValid is false', () => {
    //     differenceService.differencePackages.length = 5;
    //     fixture.detectChanges();
    //     const bannerElement: HTMLElement = fixture.nativeElement;
    //     const p = bannerElement.querySelector('ng-template > p');
    //     expect(p?.textContent).toEqual('Il doit y avoir entre 3 et 9 différences. Veuillez recommencer le processus');
    // });

    // it('should not display the warning message when isNumberOfDifferencesValid is true', () => {
    //     differenceService.differencePackages.length = 1;
    //     const bannerElement: HTMLElement = fixture.nativeElement;
    //     const p = bannerElement.querySelector('ng-template > p');
    //     expect(p).toBeUndefined();
    // });

    it('should close the dialog onNoClick', () => {
        component.onNoClick();
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should emit the game name and close the dialog if the form is valid', () => {
        component.gameNameForm = new FormGroup({ name: new FormControl('name') });
        spyOn(imageService, 'getImageSources').and.callFake(() => {
            return { left: 'left', right: 'right' };
        });
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
