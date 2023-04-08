import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { AcceptedPlayer, WaitingPlayerNameList } from '@common/game-interfaces';
import { BehaviorSubject, of } from 'rxjs';
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

    // it('should start countdown and show message if player is not in playerNames', fakeAsync(() => {
    //     component['data'] = { gameId: 'Charlie', player: 'testPlayer' };
    //     roomManagerServiceSpy.getSocketId.and.callFake(() => 'Charlie');
    //     component.handleRefusedPlayer();
    //     expect(component.countdown).toBe(TEN_SECONDS);
    //     // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- needed for test
    //     tick(12000);
    //     expect(component.refusedMessage).toBe(`Vous avez été refusé. Vous serez redirigé dans ${component.countdown} secondes`);
    //     expect(dialogRefSpy.close).toHaveBeenCalled();
    // }));

    it('should close dialog and navigate to game when player is accepted', fakeAsync(() => {
        const acceptedPlayer = {
            gameId: 'test-game-id',
            playerName: 'Alice',
            roomId: 'test-room-id',
        };
        component.handleAcceptedPlayer();
        acceptPlayerNamesMock.next(acceptedPlayer);

        tick();
    }));

    // it('should not navigate to game when player is accepted as undefined', fakeAsync(() => {
    //     spyOn(component, 'navigateToGame');
    //     component.handleAcceptedPlayer();
    //     acceptPlayerNamesMock.next(undefined as unknown as AcceptedPlayer);

    //     tick();

    //     expect(component.navigateToGame).not.toHaveBeenCalled();
    // }));

    // it('NavigateTOGame should navigate to the room-id', () => {
    //     fixture.detectChanges();
    //     component.navigateToGame('test-room-id', playerNameStub);
    //     expect(routerSpy.navigate).toHaveBeenCalledWith(['/game', 'test-room-id', playerNameStub]);
    // });
});
