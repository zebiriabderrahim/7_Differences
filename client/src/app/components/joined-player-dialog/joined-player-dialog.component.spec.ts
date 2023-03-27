import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
// import { TEN_SECONDS } from '@app/constants/constants';
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
    let routerSpy: jasmine.SpyObj<Router>;
    // const playerNameStub = 'playerNameTest';

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
        routerSpy = jasmine.createSpyObj('RouterTestingModule', ['navigate']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of('dialog closed'));
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['cancelJoining', 'getSocketId'], {
            joinedPlayerNamesByGameId$: joinedPlayerNamesMock,
            acceptedPlayerByRoom$: acceptPlayerNamesMock,
            deletedGameId$: deletedGameIdMock,
            refusedPlayerId$: of('refusedPlayerId'),
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

    // it('should handle refused and accepted players when player names are received', () => {
    //     spyOn(component, 'handleRefusedPlayer');
    //     spyOn(component, 'handleAcceptedPlayer');

    //     joinedPlayerNamesMock.next({
    //         gameId: 'test-game-id',
    //         playerNamesList: ['Alice', 'Bob', 'Charlie'],
    //     });

    //     expect(component.handleRefusedPlayer).toHaveBeenCalled();
    //     expect(component.handleAcceptedPlayer).toHaveBeenCalled();
    // });

    // it('should start countdown and show message if player is not in playerNames', fakeAsync(() => {
    //     component['data'] = { gameId: 'Charlie', player: 'testPlayer' };
    //     roomManagerServiceSpy.getSocketId.and.callFake(() => 'Charlie');
    //     // const playerNames = ['Alice', 'Charlie'];
    //     component.handleRefusedPlayer();
    //     expect(component.countdown).toBe(TEN_SECONDS);
    //     // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- needed for test
    //     tick(12000);
    //     expect(component.refusedMessage).toBe(`Vous avez été refusé. Vous serez redirigé dans ${component.countdown} secondes`);
    //     expect(dialogRefSpy.close).toHaveBeenCalled();
    // }));

    // it('should close dialog and navigate to game when player is accepted', fakeAsync(() => {
    //     spyOn(component, 'navigateToGame');
    //     const acceptedPlayer = {
    //         gameId: 'test-game-id',
    //         playerName: 'Alice',
    //         roomId: 'test-room-id',
    //     };
    //     component.handleAcceptedPlayer();
    //     acceptPlayerNamesMock.next(acceptedPlayer);

    //     tick();

    //     expect(component.navigateToGame).toHaveBeenCalled();
    // }));

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
