import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GamePageDialogComponent } from '@app/components/game-page-dialog/game-page-dialog.component';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { ReplayService } from '@app/services/replay-service/replay.service';
import { BehaviorSubject } from 'rxjs';

describe('GamePageDialogComponent', () => {
    let component: GamePageDialogComponent;
    let fixture: ComponentFixture<GamePageDialogComponent>;
    let classicServiceSpy: jasmine.SpyObj<ClassicSystemService>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;
    const replayTimerSubjectTest = new BehaviorSubject<number>(0);
    const replayDifferenceFoundSubjectTest = new BehaviorSubject<number>(0);
    const replayOpponentDifferenceFoundSubjectTest = new BehaviorSubject<number>(0);

    beforeEach(async () => {
        replayServiceSpy = jasmine.createSpyObj('ReplayService', ['resetReplay'], {
            replayTimer$: replayTimerSubjectTest,
            replayDifferenceFound$: replayDifferenceFoundSubjectTest,
            replayOpponentDifferenceFound$: replayOpponentDifferenceFoundSubjectTest,
        });
        classicServiceSpy = jasmine.createSpyObj('ClassicService', ['abandonGame']);
        await TestBed.configureTestingModule({
            declarations: [GamePageDialogComponent],
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
                {
                    provide: ReplayService,
                    useValue: replayServiceSpy,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageDialogComponent);
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
