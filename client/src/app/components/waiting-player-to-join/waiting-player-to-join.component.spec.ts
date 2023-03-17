import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { WaitingForPlayerToJoinComponent } from './waiting-player-to-join.component';

describe('WaitingPlayerToJoinComponent', () => {
    let component: WaitingForPlayerToJoinComponent;
    let fixture: ComponentFixture<WaitingForPlayerToJoinComponent>;
    let roomManagerService: RoomManagerService;
    let clientSocketService: ClientSocketService;

    beforeEach(async () => {
        // roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['refusePlayer']);
        // clientSocketServiceSpy = jasmine.createSpyObj('ClientSocketService', ['send']);
        await TestBed.configureTestingModule({
            declarations: [WaitingForPlayerToJoinComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
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
});
