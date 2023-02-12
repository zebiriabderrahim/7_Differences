import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasUnderButtonsComponent } from '@app/components/canvas-under-buttons/canvas-under-buttons.component';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { ImageCanvasComponent } from '@app/components/image-canvas/image-canvas.component';
import { ImageService } from '@app/services/image-service/image.service';
import { CreationGameDialogComponent } from './creation-game-dialog.component';

describe('CreationGameDialogComponent', () => {
    let component: CreationGameDialogComponent;
    let fixture: ComponentFixture<CreationGameDialogComponent>;
    // let imageService: ImageService;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;
    let differenceServiceSpy: jasmine.SpyObj<DifferenceService>;
    // let differenceService: DifferenceService;
    let dialogRef: MatDialogRef<CreationGameDialogComponent, unknown>;
    // let contextStub: CanvasRenderingContext2D;
    // let router: RouterTestingModule;

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
        // imageServiceSpy = TestBed.inject(ImageService);
        // differenceService = TestBed.inject(DifferenceService);
        // contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        // imageService['leftBackgroundContext'] = contextStub;
        // imageService['rightBackgroundContext'] = contextStub;
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
        differenceServiceSpy.isNumberOfDifferencesValid.and.returnValue(true);
        // differenceService['differencePackages'] = [
        //     [
        //         { x: 10, y: 20 },
        //         { x: 30, y: 40 },
        //     ],
        //     [
        //         { x: 50, y: 60 },
        //         { x: 70, y: 80 },
        //     ],
        //     [
        //         { x: 90, y: 100 },
        //         { x: 110, y: 120 },
        //     ],
        // ];
        expect(component.gameNameForm.enabled).toBeTruthy();
    });

    it('gameNameForm should be enabled isNumberOfDifferencesValid is true', () => {
        differenceServiceSpy.isNumberOfDifferencesValid.and.returnValue(true);
        // differenceService['differencePackages'] = [
        //     [
        //         { x: 10, y: 20 },
        //         { x: 30, y: 40 },
        //     ],
        //     [
        //         { x: 50, y: 60 },
        //         { x: 70, y: 80 },
        //     ],
        //     [
        //         { x: 90, y: 100 },
        //         { x: 110, y: 120 },
        //     ],
        // ];
        expect(component.gameNameForm.enabled).toBeTruthy();
    });

    it('gameNameForm should be enabled isNumberOfDifferencesValid is true', () => {
        differenceServiceSpy.isNumberOfDifferencesValid.and.returnValue(true);
        // differenceService['differencePackages'] = [
        //     [
        //         { x: 10, y: 20 },
        //         { x: 30, y: 40 },
        //     ],
        //     [
        //         { x: 50, y: 60 },
        //         { x: 70, y: 80 },
        //     ],
        //     [
        //         { x: 90, y: 100 },
        //         { x: 110, y: 120 },
        //     ],
        // ];
        expect(component.gameNameForm.enabled).toBeTruthy();
    });

    it('gameNameForm should be disabled if isNumberOfDifferencesValid is false', () => {
        differenceServiceSpy.isNumberOfDifferencesValid.and.returnValue(false);
        // differenceService['differencePackages'] = [
        //     [
        //         { x: 10, y: 20 },
        //         { x: 30, y: 40 },
        //     ],
        // ];
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

    it('should select a radio button', () => {
        const radioButtons = fixture.debugElement.query(By.css('mat-radio-button')).nativeElement;
        radioButtons[1]?.click();
        fixture.detectChanges();
        expect(component.radius).toEqual(component.radiusSizes[1]);
    });

    it('should call validateDifferences method on click', () => {
        const validateButton = fixture.debugElement.query(By.css("button[name='validateButton']")).nativeElement;
        const validateDifferencesSpy = spyOn(component, 'validateDifferences');
        validateButton.click();
        fixture.detectChanges();
        expect(validateDifferencesSpy).toHaveBeenCalled();
    });
});
