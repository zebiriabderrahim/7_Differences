import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasUnderButtonsComponent } from '@app/components/canvas-under-buttons/canvas-under-buttons.component';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { ImageCanvasComponent } from '@app/components/image-canvas/image-canvas.component';
import { ImageService } from '@app/services/image-service/image.service';
import { of } from 'rxjs';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;
    let imageService: ImageService;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            declarations: [CreationPageComponent, ImageCanvasComponent, CanvasUnderButtonsComponent, MatIcon],
            imports: [
                NoopAnimationsModule,
                MatDialogModule,
                RouterTestingModule,
                MatFormFieldModule,
                MatRadioModule,
                MatInputModule,
                FormsModule,
                HttpClientTestingModule,
                MatButtonToggleModule,
                MatSelectModule,
            ],
            providers: [{ provide: MatDialog, useValue: matDialogSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationPageComponent);
        imageService = TestBed.inject(ImageService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('validateDifferences should open imageNotSetDialog with config if images are set', async () => {
        matDialogSpy.open.and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<CreationGameDialogComponent>);
        spyOn(imageService, 'areImagesSet').and.callFake(() => {
            return true;
        });

        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for the mock
        spyOn(component['router'], 'navigate').and.callFake(async () => {
            return {} as Promise<boolean>;
        });

        component.validateDifferences();
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = component.radius;
        expect(matDialogSpy.open).toHaveBeenCalledWith(CreationGameDialogComponent, dialogConfig);
    });

    it('validateDifferences should open imageNotSetDialog if images are not set', () => {
        spyOn(imageService, 'areImagesSet').and.callFake(() => {
            return false;
        });
        component.validateDifferences();
        expect(matDialogSpy.open).toHaveBeenCalled();
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
