import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SoloGameViewDialogComponent } from '@app/components/solo-game-view-dialog/solo-game-view-dialog.component';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';

describe('SoloGameViewDialogComponent', () => {
    let component: SoloGameViewDialogComponent;
    let fixture: ComponentFixture<SoloGameViewDialogComponent>;
    let classicServiceSpy: jasmine.SpyObj<ClassicSystemService>;

    beforeEach(async () => {
        classicServiceSpy = jasmine.createSpyObj('ClassicService', ['abandonGame']);
        await TestBed.configureTestingModule({
            declarations: [SoloGameViewDialogComponent],
            imports: [MatDialogModule],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
                {
                    provide: MatDialog,
                },
                {
                    provide: ClassicSystemService,
                    useValue: classicServiceSpy,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloGameViewDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('abandonGame should call classicService.abandonGame', () => {
        component.abandonGame();
        expect(classicServiceSpy.abandonGame).toHaveBeenCalled();
    });

    it('should display the correct header and message based on the action', () => {
        component.data = { action: 'abandon', message: 'Êtes-vous certain de vouloir abandonner la partie ?' };
        fixture.detectChanges();

        const abandonHeader = fixture.nativeElement.querySelector('h1');
        const abandonMessage = fixture.nativeElement.querySelector('div p');

        expect(abandonHeader.innerText).toBe('Confirmation');
        expect(abandonMessage.innerText).toBe('Êtes-vous certain de vouloir abandonner la partie ?');

        component.data = { action: 'endGame', message: 'Bravo! Vous aviez trouvé les différences' };
        fixture.detectChanges();

        const endHeader = fixture.nativeElement.querySelector('h1');
        const endHessage = fixture.nativeElement.querySelector('div p');

        expect(endHeader.innerText).toBe('Fin de la partie');
        expect(endHessage.innerText).toBe('Bravo! Vous aviez trouvé les différences');
    });
});
