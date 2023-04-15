import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Actions } from '@app/enum/delete-reset-actions';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { of } from 'rxjs';
import { DeleteResetConfirmationDialogComponent } from './delete-reset-confirmation-dialog.component';

describe('DeleteResetConfirmationDialogComponent', () => {
    let component: DeleteResetConfirmationDialogComponent;
    let fixture: ComponentFixture<DeleteResetConfirmationDialogComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    const gameId = '123';

    beforeEach(async () => {
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['resetAllTopTimes', 'allGamesDeleted', 'resetTopTime']);
        communicationServiceSpy = jasmine.createSpyObj('communicationService', ['deleteAllGames', 'deleteGameById ']);
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
});
