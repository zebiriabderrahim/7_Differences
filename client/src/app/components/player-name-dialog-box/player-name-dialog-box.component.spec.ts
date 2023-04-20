/* eslint-disable @typescript-eslint/no-explicit-any -- needed to spy on private methods*/
// to spyOn handelCreateUndoCreationSpy and do nothing
/* eslint-disable @typescript-eslint/no-empty-function */
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { PlayerNameAvailability, RoomAvailability } from '@common/game-interfaces';
import { BehaviorSubject } from 'rxjs';
import { PlayerNameDialogBoxComponent } from './player-name-dialog-box.component';

describe('PlayerNameDialogBoxComponent', () => {
    let component: PlayerNameDialogBoxComponent;
    let fixture: ComponentFixture<PlayerNameDialogBoxComponent>;
    let dialogRef: MatDialogRef<PlayerNameDialogBoxComponent, unknown>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let oneVsOneRoomsAvailabilityByRoomIdMock: BehaviorSubject<RoomAvailability>;
    let deletedGameIdMock: BehaviorSubject<string>;
    let playerNameAvailabilityMock: BehaviorSubject<PlayerNameAvailability>;

    beforeEach(async () => {
        oneVsOneRoomsAvailabilityByRoomIdMock = new BehaviorSubject<RoomAvailability>({ gameId: '1', isAvailableToJoin: true, hostId: 'def456' });
        playerNameAvailabilityMock = new BehaviorSubject<PlayerNameAvailability>({ gameId: '1', isNameAvailable: false });
        deletedGameIdMock = new BehaviorSubject<string>('12');
        const mockIsNameTaken = new BehaviorSubject({ gameId: '1', isNameAvailable: false });
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['isPlayerNameIsAlreadyTaken', 'isNameTaken$'], {
            isNameTaken$: mockIsNameTaken,
            oneVsOneRoomsAvailabilityByRoomId$: oneVsOneRoomsAvailabilityByRoomIdMock,
            deletedGameId$: deletedGameIdMock,
            playerNameAvailability$: playerNameAvailabilityMock,
        });
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, CommonModule, BrowserAnimationsModule],
            declarations: [PlayerNameDialogBoxComponent],
            providers: [
                { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
                { provide: MAT_DIALOG_DATA, useValue: { id: '1' } },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerNameDialogBoxComponent);
        component = fixture.componentInstance;
        dialogRef = TestBed.inject(MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the playerNameForm', () => {
        expect(component.playerNameForm instanceof FormGroup).toBeTruthy();
        expect(component.playerNameForm.controls.name instanceof FormControl).toBeTruthy();
    });

    it('should emit the player name and close the dialog if the form is valid', () => {
        component.playerNameForm = new FormGroup({ name: new FormControl('test') });
        component.submitForm();
        expect(dialogRef.close).toHaveBeenCalledWith('test');
    });

    it('should not emit the player name or close the dialog if the form is empty', () => {
        component.playerNameForm = new FormGroup({ name: new FormControl('', [Validators.required, Validators.pattern(/^\S*$/)]) });
        component.submitForm();
        expect(dialogRef.close).not.toHaveBeenCalledWith('');
    });

    it('ngOnInit should call handelCreateUndoCreation', () => {
        const handelCreateUndoCreationSpy = spyOn<any>(component, 'handleCreateUndoCreation').and.callFake(() => {});
        component.ngOnInit();
        expect(handelCreateUndoCreationSpy).toHaveBeenCalled();
    });

    it('should close dialog when room is not available to join', () => {
        const gameId = '1';
        const roomAvailability = { gameId, isAvailableToJoin: false, hostId: 'abc123' };
        component['handleCreateUndoCreation'](gameId);
        oneVsOneRoomsAvailabilityByRoomIdMock.next(roomAvailability);
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('handleGameCardDelete should not close the dialog when the deleted game ID does not match the current game ID', () => {
        component['handleGameCardDelete']();
        deletedGameIdMock.next('456');
        expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('handleGameCardDelete should close the dialog when the deletedGameId$ event is triggered with a matching gameId', () => {
        const gameId = 'test-game-id';
        component['data'] = { gameId };
        fixture.detectChanges();
        deletedGameIdMock.next(gameId);
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should return null when data is not set', async () => {
        component['data'] = undefined as unknown as { gameId: 'test' };
        const control = new FormControl();
        const result = await component['validatePlayerName'](control);
        expect(result).toBeNull();
    });

    it('validatePlayerName should return null when player name is available', async () => {
        component['data'] = { gameId: 'game-123' };
        roomManagerServiceSpy.isPlayerNameIsAlreadyTaken.and.returnValue(void 0);
        playerNameAvailabilityMock.next({ gameId: 'game-123', isNameAvailable: true });

        const result = await component['validatePlayerName'](new FormControl(''));
        expect(result).toBeNull();
    });

    it('validatePlayerName should return "nameTaken" error when player name is not available', async () => {
        component['data'] = { gameId: 'game-123' };
        roomManagerServiceSpy.isPlayerNameIsAlreadyTaken.and.returnValue(void 0);
        playerNameAvailabilityMock.next({ gameId: 'game-123', isNameAvailable: false });

        const result = await component['validatePlayerName'](new FormControl(''));
        expect(result).toEqual({ nameTaken: true });
    });

    it('validatePlayerName should call roomManagerService.isPlayerNameIsAlreadyTaken with correct payload', async () => {
        const control = new FormControl('');
        component['data'] = { gameId: 'game-123' };
        roomManagerServiceSpy.isPlayerNameIsAlreadyTaken.and.returnValue(void 0);
        playerNameAvailabilityMock.next({ gameId: 'game-123', isNameAvailable: false });

        control.setValue('player-1');
        await component['validatePlayerName'](control);
        expect(roomManagerServiceSpy.isPlayerNameIsAlreadyTaken).toHaveBeenCalled();
    });
});
