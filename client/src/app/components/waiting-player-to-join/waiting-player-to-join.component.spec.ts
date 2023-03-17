import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { map, of } from 'rxjs';
import { WaitingForPlayerToJoinComponent } from './waiting-player-to-join.component';

describe('WaitingPlayerToJoinComponent', () => {
    let component: WaitingForPlayerToJoinComponent;
    let fixture: ComponentFixture<WaitingForPlayerToJoinComponent>;
    let roomManagerService: RoomManagerService;
    let clientSocketServiceSpy: jasmine.SpyObj<ClientSocketService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<WaitingForPlayerToJoinComponent>>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        clientSocketServiceSpy = jasmine.createSpyObj('ClientSocketService', ['send', 'disconnect']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of('dialog closed'));
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [WaitingForPlayerToJoinComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: Router, useValue: router },
                { provide: ClientSocketService, useValue: clientSocketServiceSpy },
            ],
        }).compileComponents();
        roomManagerService = TestBed.inject(RoomManagerService);
        fixture = TestBed.createComponent(WaitingForPlayerToJoinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('refusePlayer should refuse the player using the roomManagerService', () => {
        const gameId = '12';
        const playerName = 'John';
        component['data'] = { roomId: '23', player: playerName, gameId };
        spyOn(roomManagerService, 'refusePlayer');
        component.refusePlayer('John');
        expect(roomManagerService.refusePlayer).toHaveBeenCalledWith(gameId, playerName);
    });

    it('acceptPlayer should navigate to the game page after dialog close', () => {
        spyOn(roomManagerService, 'acceptPlayer');
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for fake afterClosed
        dialogRefSpy.afterClosed.and.returnValue(of({}).pipe(map(() => {})));
        component.acceptPlayer('Alice');
        expect(router.navigate).toHaveBeenCalledWith(['/game', undefined]);
    });

    it('acceptPlayer should refuse all other players and accept the given player', () => {
        const roomManagerServiceSpy = spyOn(roomManagerService, 'acceptPlayer');
        const refusePlayerSpy = spyOn(component, 'refusePlayer');
        component.playerNames = ['Alice', 'Bob', 'Charlie'];
        fixture.detectChanges();
        component.acceptPlayer('Alice');
        expect(refusePlayerSpy).toHaveBeenCalledWith('Bob');
        expect(refusePlayerSpy).toHaveBeenCalledWith('Charlie');
        expect(roomManagerServiceSpy).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/game', undefined]);
    });

    it('undoCreateOneVsOneRoom should delete created one vs one room and refuse all players', () => {
        const gameId = '123';
        const playerNames = ['John', 'Jane'];
        component['data'] = { roomId: '23', player: playerNames[0], gameId };
        spyOn(roomManagerService, 'deleteCreatedOneVsOneRoom');
        spyOn(component, 'refusePlayer');
        component.playerNames = playerNames;
        component.undoCreateOneVsOneRoom();
        expect(roomManagerService.deleteCreatedOneVsOneRoom).toHaveBeenCalledWith(gameId);
        expect(component.refusePlayer).toHaveBeenCalledTimes(playerNames.length);
        playerNames.forEach((player) => {
            expect(component.refusePlayer).toHaveBeenCalledWith(player);
        });
    });
});
