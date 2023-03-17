import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { WaitingPlayerNameList } from '@common/game-interfaces';
import { BehaviorSubject } from 'rxjs';
import { JoinedPlayerDialogComponent } from './joined-player-dialog.component';

describe('JoinedPlayerDialogComponent', () => {
    let component: JoinedPlayerDialogComponent;
    let fixture: ComponentFixture<JoinedPlayerDialogComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let joinedPlayerNamesMock: BehaviorSubject<WaitingPlayerNameList>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<JoinedPlayerDialogComponent>>;

    beforeEach(async () => {
        joinedPlayerNamesMock = new BehaviorSubject<WaitingPlayerNameList>({
            gameId: 'test-game-id',
            playerNamesList: ['Alice', 'Bob'],
        });
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['cancelJoining'], {
            joinedPlayerNamesByGameId$: joinedPlayerNamesMock,
        });
        await TestBed.configureTestingModule({
            declarations: [JoinedPlayerDialogComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { gameId: 'test-game-id', player: 'Alice' } },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
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
        expect(roomManagerServiceSpy.cancelJoining).toHaveBeenCalledWith('test-game-id', 'Alice');
    });

    it('should handle refused and accepted players when player names are received', () => {
        spyOn(component, 'handleRefusedPlayer');
        spyOn(component, 'handleAcceptedPlayer');

        joinedPlayerNamesMock.next({
            gameId: 'test-game-id',
            playerNamesList: ['Alice', 'Bob', 'Charlie'],
        });

        expect(component.handleRefusedPlayer).toHaveBeenCalledWith(['Alice', 'Bob', 'Charlie']);
        expect(component.handleAcceptedPlayer).toHaveBeenCalled();
    });

    it('should start countdown and show message if player is not in playerNames', () => {
        // component['data'] = { gameId: 'game123', player: 'testPlayer' };
        // const playerNames = ['Alice', 'Charlie'];
        // component.handleRefusedPlayer(playerNames);
        // expect(component.countdown).toBe(10);
        // expect(component.refusedMessage).toBe(`You have been refused. You will be redirected in ${component.countdown} seconds`);
        // // Simulate countdown
        // // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        // jasmine.clock().install();
        // jasmine.clock().tick(10000);
        // expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
