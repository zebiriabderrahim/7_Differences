import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
// import { of } from 'rxjs';
import { WaitingForPlayerToJoinComponent } from './waiting-player-to-join.component';

describe('WaitingPlayerToJoinComponent', () => {
    let component: WaitingForPlayerToJoinComponent;
    let fixture: ComponentFixture<WaitingForPlayerToJoinComponent>;
    let roomManagerService: RoomManagerService;
    let clientSocketService: ClientSocketService;
    // let dialogRef: MatDialogRef<WaitingForPlayerToJoinComponent>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        // roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['refusePlayer']);
        // clientSocketServiceSpy = jasmine.createSpyObj('ClientSocketService', ['send']);
        // dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'emit']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [WaitingForPlayerToJoinComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();
        roomManagerService = TestBed.inject(RoomManagerService);
        clientSocketService = TestBed.inject(ClientSocketService);
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
        spyOn(clientSocketService, 'send');
        component.refusePlayer('John');
        expect(roomManagerService.refusePlayer).toHaveBeenCalledWith(gameId, playerName);
    });

    // acceptPlayer

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
