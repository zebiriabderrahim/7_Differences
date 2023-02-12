import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
// import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasUnderButtonsComponent } from '@app/components/canvas-under-buttons/canvas-under-buttons.component';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
// import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { ImageCanvasComponent } from '@app/components/image-canvas/image-canvas.component';
import { ImageService } from '@app/services/image-service/image.service';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let imageService: ImageService;
    // let router: RouterTestingModule;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            declarations: [CreationPageComponent, ImageCanvasComponent, CanvasUnderButtonsComponent, MatIcon],
            imports: [MatDialogModule, RouterTestingModule, MatRadioModule, FormsModule, HttpClientTestingModule],
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

    it('validateDifferences should open imageNotSetDialog with config if images are set', () => {
        spyOn(imageService, 'areImagesSet').and.callFake(() => {
            return true;
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

    // it('should display the number of differences when displayDifferences is defined', () => {
    //     differenceService.differencePackages.length = 5;
    //     fixture.detectChanges();
    //     const bannerElement: HTMLElement = fixture.nativeElement;
    //     const p = bannerElement.querySelector('div > p');
    //     expect(p?.textContent).toContain(component.displayDifferences);
    // });

    // it('should navigate to the Configuration page when clicked', () => {
    //     const bannerElement: HTMLElement = fixture.nativeElement;
    //     const buttonElement = bannerElement.querySelector('div > button');
    //     const navigateSpy = spyOn(router, 'navigate').and.stub();
    //     buttonElement.click();
    //     expect(navigateSpy).toHaveBeenCalledWith(['configRoute']);
    // });
});
