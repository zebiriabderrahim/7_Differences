import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GamePageDialogComponent } from '@app/components/game-page-dialog/game-page-dialog.component';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { ReplayService } from '@app/services/replay-service/replay.service';
import { BehaviorSubject } from 'rxjs';

describe('GamePageDialogComponent', () => {
    let component: GamePageDialogComponent;
    let fixture: ComponentFixture<GamePageDialogComponent>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;
    const replayTimerSubjectTest = new BehaviorSubject<number>(0);
    const replayDifferenceFoundSubjectTest = new BehaviorSubject<number>(0);
    const replayOpponentDifferenceFoundSubjectTest = new BehaviorSubject<number>(0);

    beforeEach(async () => {
        replayServiceSpy = jasmine.createSpyObj('ReplayService', ['resetReplay', 'startReplay', 'restartTimer'], {
            replayTimer$: replayTimerSubjectTest,
            replayDifferenceFound$: replayDifferenceFoundSubjectTest,
            replayOpponentDifferenceFound$: replayOpponentDifferenceFoundSubjectTest,
        });
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['abandonGame']);
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
                    provide: GameManagerService,
                    useValue: gameManagerServiceSpy,
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

    it('abandonGame should call abandonGame on classicSystem', () => {
        component.abandonGame();
        expect(gameManagerServiceSpy.abandonGame).toHaveBeenCalled();
    });

    it('should call resetReplay on replayService', () => {
        component.leaveGame();
        expect(replayServiceSpy.resetReplay).toHaveBeenCalled();
    });

    it('replay should call startReplay and restartTimer on replayService', () => {
        component.replay();
        expect(replayServiceSpy.startReplay).toHaveBeenCalled();
        expect(replayServiceSpy.restartTimer).toHaveBeenCalled();
    });
});
