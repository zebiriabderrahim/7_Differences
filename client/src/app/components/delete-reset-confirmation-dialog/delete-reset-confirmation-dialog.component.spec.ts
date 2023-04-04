import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { of } from 'rxjs';
import { DeleteResetConfirmationDialogComponent } from './delete-reset-confirmation-dialog.component';

describe('DeleteResetConfirmationDialogComponent', () => {
    let component: DeleteResetConfirmationDialogComponent;
    let fixture: ComponentFixture<DeleteResetConfirmationDialogComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;

    beforeEach(async () => {
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', [
            'resetAllTopTimes',
            'allGamesDeleted',
            'gameCardDeleted',
            'resetTopTime',
        ]);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['deleteAllGames', 'deleteGameById']);
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

    it('resetAllTopTimes should call the resetAllTopTimes method of roomManagerService', () => {
        component.resetAllTopTimes();
        expect(roomManagerServiceSpy.resetAllTopTimes).toHaveBeenCalled();
    });

    it('deleteAllGames should call deleteAllGames on CommunicationService and allGamesDeleted on RoomManagerService', () => {
        communicationServiceSpy.deleteAllGames.and.returnValue(of(void 0));
        component.deleteAllGames();
        expect(communicationServiceSpy.deleteAllGames).toHaveBeenCalled();
        expect(roomManagerServiceSpy.allGamesDeleted).toHaveBeenCalled();
    });

    it('deleteGameCard should call deleteGameById on communicationService and gameCardDeleted on roomManagerService', () => {
        communicationServiceSpy.deleteGameById.and.returnValue(of(void 0));
        component.deleteGameCard();
        expect(communicationServiceSpy.deleteGameById).toHaveBeenCalled();
        expect(roomManagerServiceSpy.gameCardDeleted).toHaveBeenCalled();
    });

    it('resetTopTime should call resetTopTime on roomManagerService with gameId', () => {
        component.resetTopTime();
        expect(roomManagerServiceSpy.resetTopTime).toHaveBeenCalled();
    });
});
