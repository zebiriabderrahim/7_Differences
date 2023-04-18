import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Actions } from '@app/enum/delete-reset-actions';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { Subject, of } from 'rxjs';
import { DeleteResetConfirmationDialogComponent } from './delete-reset-confirmation-dialog.component';

describe('DeleteResetConfirmationDialogComponent', () => {
    let component: DeleteResetConfirmationDialogComponent;
    let fixture: ComponentFixture<DeleteResetConfirmationDialogComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let mockDeleteAllGames: Subject<void>;
    const gameId = '123';

    beforeEach(async () => {
        mockDeleteAllGames = new Subject<void>();
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', [
            'resetAllTopTimes',
            'allGamesDeleted',
            'resetTopTime',
            'notifyGameCardDeleted',
            'gamesHistoryDeleted',
        ]);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['deleteAllGames', 'deleteGameById', 'deleteAllGamesHistory']);
        communicationServiceSpy.deleteAllGamesHistory.and.returnValue(mockDeleteAllGames.asObservable());

        await TestBed.configureTestingModule({
            declarations: [DeleteResetConfirmationDialogComponent],
            imports: [MatDialogModule, HttpClientModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteResetConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('resetAllTopTimes should call resetAllTopTimes on roomManagerService', () => {
        component.resetAllTopTimes();
        expect(roomManagerServiceSpy.resetAllTopTimes).toHaveBeenCalled();
    });

    it('should call communicationService.deleteAllGames and roomManagerService.allGamesDeleted() when deleteAllGames() is called', () => {
        communicationServiceSpy.deleteAllGames.and.returnValue(of(void 0));
        component.deleteAllGames();
        expect(communicationServiceSpy.deleteAllGames).toHaveBeenCalled();
        expect(roomManagerServiceSpy.allGamesDeleted).toHaveBeenCalled();
    });

    it('resetTopTime should call resetTopTime with the correct gameId', () => {
        component.data = { actions: Actions.DeleteGame, gameId };
        component.resetTopTime();
        expect(roomManagerServiceSpy.resetTopTime).toHaveBeenCalledWith(gameId);
    });

    it('deleteGameCard should call communicationService.deleteGameById with the correct gameId', () => {
        component.data = { actions: Actions.DeleteGame, gameId };
        communicationServiceSpy.deleteGameById.and.returnValue(of(void 0));
        component.deleteGameCard();
        expect(communicationServiceSpy.deleteGameById).toHaveBeenCalledWith(gameId);
    });

    it('deleteAllGamesHistory should call roomManager.gamesHistoryDeleted', () => {
        component.deleteAllGamesHistory();
        mockDeleteAllGames.next();
        component.deleteAllGamesHistory();
        expect(roomManagerServiceSpy.gamesHistoryDeleted).toHaveBeenCalled();
    });
});
