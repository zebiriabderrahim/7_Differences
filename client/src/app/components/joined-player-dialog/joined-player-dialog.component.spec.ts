import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { COUNTDOWN_TIME, WAITING_TIME } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { AcceptedPlayer, WaitingPlayerNameList } from '@common/game-interfaces';
import { BehaviorSubject, interval, of, takeWhile } from 'rxjs';
import { JoinedPlayerDialogComponent } from './joined-player-dialog.component';

describe('JoinedPlayerDialogComponent', () => {
    let component: JoinedPlayerDialogComponent;
    let fixture: ComponentFixture<JoinedPlayerDialogComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let joinedPlayerNamesMock: BehaviorSubject<WaitingPlayerNameList>;
    let acceptPlayerNamesMock: BehaviorSubject<AcceptedPlayer>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<JoinedPlayerDialogComponent>>;
    let deletedGameIdMock: BehaviorSubject<string>;
    let refusePlayerIdMock: BehaviorSubject<string>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        deletedGameIdMock = new BehaviorSubject<string>('idMock');
        joinedPlayerNamesMock = new BehaviorSubject<WaitingPlayerNameList>({
            gameId: 'test-game-id',
            playerNamesList: ['Alice', 'Bob', 'Charlie'],
        });
        acceptPlayerNamesMock = new BehaviorSubject<AcceptedPlayer>({
            gameId: 'Jeu de la mort',
            roomId: 'test-room-id',
            playerName: 'Alice',
        });
        refusePlayerIdMock = new BehaviorSubject<string>('refusedPlayerId');
        routerSpy = jasmine.createSpyObj('RouterTestingModule', ['navigate']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of('dialog closed'));
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['cancelJoining', 'getSocketId'], {
            joinedPlayerNamesByGameId$: joinedPlayerNamesMock,
            acceptedPlayerByRoom$: acceptPlayerNamesMock,
            deletedGameId$: deletedGameIdMock,
            refusedPlayerId$: refusePlayerIdMock,
            roomId$: of('roomId'),
            isPlayerAccepted$: of(true),
        });
        await TestBed.configureTestingModule({
            declarations: [JoinedPlayerDialogComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { gameId: 'test-game-id', player: 'Alice' } },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinedPlayerDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call roomManagerService.cancelJoining with correct arguments', () => {
        component.cancelJoining();
        expect(roomManagerServiceSpy.cancelJoining).toHaveBeenCalledWith('test-game-id');
    });

    it('should handle refused players when refuse player names are received', () => {
        const countDownSpy = spyOn(component, 'countDownBeforeClosing');
        component.handleRefusedPlayer();
        roomManagerServiceSpy.getSocketId.and.callFake(() => 'refusedPlayerId');
        refusePlayerIdMock.next('refusedPlayerId');
        expect(countDownSpy).toHaveBeenCalled();
    });

    it('should start countdown and show message if player is refuse or if gameCard is delete', fakeAsync(() => {
        component.countDownBeforeClosing('Test message');
        expect(component.countdown).toBe(COUNTDOWN_TIME);
        interval(WAITING_TIME)
            .pipe(takeWhile(() => component.countdown > 0))
            .subscribe(() => {
                component.countDownBeforeClosing('Test message');
            });
        // Needed to not have periodic timer(s) still in the queue.
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        tick(12000);
        expect(dialogRefSpy.close).toHaveBeenCalled();
    }));
});
