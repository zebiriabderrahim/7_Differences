import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TEN_SECONDS } from '@app/constants/constants';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { BehaviorSubject, of } from 'rxjs';
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
            ['refusePlayer', 'acceptPlayer', 'deleteCreatedOneVsOneRoom', 'getJoinedPlayerNames'],
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

    // it('getJoinedPlayerNamesByGameId should subscribe to joinedPlayerNamesByGameId$ and set playerNames', () => {
    //     joinedPlayerNamesMock.next({
    //         gameId: 'test-game-id',
    //         playerNamesList: ['Alice', 'Bob', 'Charlie'],
    //     });

    //     expect(component['playerNamesSubscription']).toBeDefined();
    //     expect(component.playerNames).toEqual(joinedPlayerNamesMock.value.playerNamesList);
    // });

    it('should call countDownBeforeClosing onInit', () => {
        const countDownBeforeClosingSpy = spyOn(component, 'countDownBeforeClosing');
        component.ngOnInit();
        deletedGameIdMock.next('test-game-id');
        expect(countDownBeforeClosingSpy).toHaveBeenCalled();
    });

    // it('countDownBeforeClosing should set countdown', () => {
    //     jasmine.clock().install();
    //     component['countdown'] = TEN_SECONDS;
    //     component.ngOnInit();
    //     component.countDownBeforeClosing();
    //     deletedGameIdMock.next('test-game-id');
    //     expect(component['countdown']).toEqual(TEN_SECONDS);
    //     jasmine.clock().tick(TEN_SECONDS);
    //     expect(dialogRefSpy.close).not.toHaveBeenCalled();
    // });

    // it('countDownBeforeClosing should set countdown', () => {
    //     jasmine.clock().install();
    //     component['countdown'] = TEN_SECONDS;
    //     component.ngOnInit();
    //     component.countDownBeforeClosing();
    //     deletedGameIdMock.next('test-game-id');
    //     jasmine.clock().tick(TEN_SECONDS);
    //     component.countDownBeforeClosing();
    //     jasmine.clock().tick(TEN_SECONDS);
    //     expect(dialogRefSpy.close).not.toHaveBeenCalled();
    // });

    it('countDownBeforeClosing should set countdown', () => {
        component['countdown'] = 1;
        component.ngOnInit();
        component.countDownBeforeClosing();
        deletedGameIdMock.next('test-game-id');
        jasmine.clock().install();
        jasmine.clock().tick(TEN_SECONDS);
        component.countDownBeforeClosing();
        jasmine.clock().tick(TEN_SECONDS);
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
        component['data'] = { gameId: 'Charlie', player: 'testPlayer', roomId: 'testRoom' };
        deletedGameIdMock.next('Charlie');
        component.ngOnInit();
        expect(component.countdown).toBe(TEN_SECONDS);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- needed for test
        tick(12000);
        expect(dialogRefSpy.close).toHaveBeenCalled();
    }));

    it('refusePlayer should refuse the player using the roomManagerService', () => {
        const gameId = '12';
        const playerName = 'John';
        component['data'] = { roomId: '23', player: playerName, gameId };
        component.refusePlayer('John');
        expect(roomManagerServiceSpy.refusePlayer).toHaveBeenCalledWith(gameId, playerName);
    });

    // it('acceptPlayer should navigate to the game page after dialog close', () => {
    //     // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for fake afterClosed
    //     dialogRefSpy.afterClosed.and.returnValue(of({}).pipe(map(() => {})));
    //     component.acceptPlayer('Alice');
    //     expect(router.navigate).toHaveBeenCalledWith(['/game', undefined, 'Alice']);
    // });

    // it('acceptPlayer should refuse all other players and accept the given player', () => {
    //     const refusePlayerSpy = spyOn(component, 'refusePlayer');
    //     const stubName = 'Alice';
    //     component.playerNames = [stubName, 'Bob', 'Charlie'];
    //     fixture.detectChanges();
    //     component.acceptPlayer(stubName);
    //     expect(refusePlayerSpy).toHaveBeenCalledWith('Bob');
    //     expect(refusePlayerSpy).toHaveBeenCalledWith('Charlie');
    //     expect(roomManagerServiceSpy.acceptPlayer).toHaveBeenCalled();
    //     expect(router.navigate).toHaveBeenCalledWith(['/game', undefined, stubName]);
    // });

    // it('undoCreateOneVsOneRoom should delete created one vs one room and refuse all players', () => {
    //     const gameId = '123';
    //     const playerNames = ['John', 'Jane'];
    //     component['data'] = { roomId: '23', player: playerNames[0], gameId };
    //     spyOn(component, 'refusePlayer');
    //     component.playerNames = playerNames;
    //     component.undoCreateOneVsOneRoom();
    //     expect(roomManagerServiceSpy.deleteCreatedOneVsOneRoom).toHaveBeenCalledWith(gameId);
    //     expect(component.refusePlayer).toHaveBeenCalledTimes(playerNames.length);
    //     playerNames.forEach((player) => {
    //         expect(component.refusePlayer).toHaveBeenCalledWith(player);
    //     });
    // });

    it('ngOnDestroy should not unsubscribe from playerNamesSubscription if it is undefined', () => {
        component['playerNamesSubscription'] = undefined;
        component.ngOnDestroy();
        expect(component['playerNamesSubscription']).toBeUndefined();
    });
});
