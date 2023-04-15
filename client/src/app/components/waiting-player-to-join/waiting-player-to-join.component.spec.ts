import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { COUNTDOWN_TIME } from '@app/constants/constants';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { PlayerData } from '@common/game-interfaces';
import { BehaviorSubject, map, of } from 'rxjs';
import { WaitingForPlayerToJoinComponent } from './waiting-player-to-join.component';

describe('WaitingPlayerToJoinComponent', () => {
    let component: WaitingForPlayerToJoinComponent;
    let fixture: ComponentFixture<WaitingForPlayerToJoinComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let clientSocketServiceSpy: jasmine.SpyObj<ClientSocketService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<WaitingForPlayerToJoinComponent>>;
    let router: jasmine.SpyObj<Router>;
    let joinedPlayerNamesMock: BehaviorSubject<string[]>;
    let deletedGameIdMock: BehaviorSubject<string>;

    beforeEach(async () => {
        deletedGameIdMock = new BehaviorSubject<string>('idMock');
        joinedPlayerNamesMock = new BehaviorSubject<string[]>(['Alice', 'Bob']);
        roomManagerServiceSpy = jasmine.createSpyObj(
            'RoomManagerService',
            ['refusePlayer', 'acceptPlayer', 'deleteCreatedOneVsOneRoom', 'getJoinedPlayerNames', 'deleteCreatedCoopRoom'],
            {
                joinedPlayerNamesByGameId$: joinedPlayerNamesMock,
                deletedGameId$: deletedGameIdMock,
            },
        );
        clientSocketServiceSpy = jasmine.createSpyObj('ClientSocketService', ['send', 'disconnect']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        dialogRefSpy.afterClosed.and.returnValue(of('dialog closed'));
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [WaitingForPlayerToJoinComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { gameId: 'test-game-id', player: 'Alice' } },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: Router, useValue: router },
                { provide: ClientSocketService, useValue: clientSocketServiceSpy },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(WaitingForPlayerToJoinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        component.ngOnDestroy();
        jasmine.clock().uninstall();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return if the data does contain gameId', () => {
        const roomId = undefined as unknown as string;
        const gameId = undefined as unknown as string;
        component['data'] = { roomId, player: 'Alice', gameId, isLimited: true };
        component.ngOnInit();
        expect(component['data']).toBeDefined();
    });

    it('should return if the data does contain gameId', () => {
        const data = undefined as unknown as { roomId: string; player: string; gameId: string; isLimited: true };
        component['data'] = data;
        component.ngOnInit();
        expect(component['data']).toBeUndefined();
    });

    it('should call countDownBeforeClosing onInit', () => {
        const countDownBeforeClosingSpy = spyOn(component, 'countDownBeforeClosing');
        component.ngOnInit();
        deletedGameIdMock.next('test-game-id');
        expect(countDownBeforeClosingSpy).toHaveBeenCalled();
    });

    it('countDownBeforeClosing should set countdown', () => {
        jasmine.clock().install();
        component['countdown'] = COUNTDOWN_TIME;
        component.ngOnInit();
        component.countDownBeforeClosing();
        deletedGameIdMock.next('test-game-id');
        expect(component['countdown']).toEqual(COUNTDOWN_TIME);
        jasmine.clock().tick(COUNTDOWN_TIME);
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('countDownBeforeClosing should set countdown', () => {
        jasmine.clock().install();
        component['countdown'] = COUNTDOWN_TIME;
        component.ngOnInit();
        component.countDownBeforeClosing();
        deletedGameIdMock.next('test-game-id');
        jasmine.clock().tick(COUNTDOWN_TIME);
        component.countDownBeforeClosing();
        jasmine.clock().tick(COUNTDOWN_TIME);
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('countDownBeforeClosing should set countdown', () => {
        component['countdown'] = 1;
        component.ngOnInit();
        component.countDownBeforeClosing();
        deletedGameIdMock.next('test-game-id');
        jasmine.clock().install();
        jasmine.clock().tick(COUNTDOWN_TIME);
        component.countDownBeforeClosing();
        jasmine.clock().tick(COUNTDOWN_TIME);
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('ngOnInit should call countDownBeforeClosing', fakeAsync(() => {
        const countDownBeforeClosingSpy = spyOn(component, 'countDownBeforeClosing');

        component.ngOnInit();
        deletedGameIdMock.next('test-game-id');
        tick();

        expect(countDownBeforeClosingSpy).toHaveBeenCalled();
    }));

    it('should start countdown and show message if player is not in playerNames', fakeAsync(() => {
        component['data'] = { gameId: 'Charlie', player: 'testPlayer', roomId: 'testRoom', isLimited: true };
        deletedGameIdMock.next('Charlie');
        component.ngOnInit();
        expect(component.countdown).toBe(COUNTDOWN_TIME);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- needed for test
        tick(12000);
        expect(dialogRefSpy.close).toHaveBeenCalled();
    }));

    it('refusePlayer should refuse the player using the roomManagerService', () => {
        const playerName = 'John';
        component.refusePlayer(playerName);
        const expectedPlayerData: PlayerData = { gameId: component['data'].gameId, playerName } as PlayerData;
        expect(roomManagerServiceSpy.refusePlayer).toHaveBeenCalledWith(expectedPlayerData);
    });

    it('acceptPlayer should navigate to the game page after dialog close', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for fake afterClosed
        dialogRefSpy.afterClosed.and.returnValue(of({}).pipe(map(() => {})));
        component.acceptPlayer('Alice');
        expect(router.navigate).toHaveBeenCalledWith(['/game']);
    });

    it('undoCreateOneVsOneRoom should delete created one vs one room and refuse all players', () => {
        const gameId = '23';
        const playerNames = ['John', 'Jane'];
        component['data'] = { roomId: '23', player: playerNames[0], gameId, isLimited: true };
        component.playerNames = playerNames;
        component.undoCreateOneVsOneRoom();
        expect(roomManagerServiceSpy.deleteCreatedOneVsOneRoom).toHaveBeenCalledWith(gameId);
    });

    it('undoCreateOneVsOneRoom should delete created coop room and refuse all players', () => {
        const gameId = '123';
        component['data'] = { roomId: '23', player: undefined as unknown as string, gameId, isLimited: false };
        component.undoCreateOneVsOneRoom();
        expect(roomManagerServiceSpy.deleteCreatedCoopRoom).toHaveBeenCalled();
    });

    it('ngOnDestroy should not unsubscribe from playerNamesSubscription if it is undefined', () => {
        component['playerNamesSubscription'] = undefined;
        component.ngOnDestroy();
        expect(component['playerNamesSubscription']).toBeUndefined();
    });
});
