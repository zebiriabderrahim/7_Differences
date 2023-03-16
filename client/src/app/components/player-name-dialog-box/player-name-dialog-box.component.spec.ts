import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { BehaviorSubject } from 'rxjs';
import { PlayerNameDialogBoxComponent } from './player-name-dialog-box.component';

describe('PlayerNameDialogBoxComponent', () => {
    let component: PlayerNameDialogBoxComponent;
    let fixture: ComponentFixture<PlayerNameDialogBoxComponent>;
    let dialogRef: MatDialogRef<PlayerNameDialogBoxComponent, unknown>;
    let roomManagerService: RoomManagerService;
    let control: FormControl;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;

    beforeEach(async () => {
        const mockIsNameTaken = new BehaviorSubject({ gameId: component['data'].gameId, isNameAvailable: true });
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['isPlayerNameIsAlreadyTaken', 'isNameTaken$'], {
            isNameTaken$: mockIsNameTaken,
        });
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [],
            providers: [
                { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
                { provide: MAT_DIALOG_DATA, useValue: { id: 1 } },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerNameDialogBoxComponent);
        component = fixture.componentInstance;
        // roomManagerService = TestBed.inject(RoomManagerService);
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

    it('validatePlayerName should return null if player name is not taken', async () => {
        control.setValue('testName');
        const result = await component.validatePlayerName(control);

        expect(roomManagerService.isPlayerNameIsAlreadyTaken).toHaveBeenCalledWith(component['data'].gameId, 'testName');
        expect(roomManagerService.isNameTaken$).toHaveBeenCalled();
        expect(result).toBeNull();
    });

    // it('validatePlayerName should return { nameTaken: true } if player name is taken', async () => {
    //     roomManagerServiceSpy.isNameTaken$ = new BehaviorSubject({ gameId: component['data'].gameId, isNameAvailable: false });
    //     const isNameTaken$ = new BehaviorSubject({ gameId: component['data'].gameId, isNameAvailable: false });
    //     roomManagerServiceSpy.isNameTaken$.subscribe((value) => {
    //         console.log(value);
    //     });

    //     control.setValue('testName');
    //     const result = await component.validatePlayerName(control);

    //     expect(roomManagerService.isPlayerNameIsAlreadyTaken).toHaveBeenCalledWith(component['data'].gameId, 'testName');
    //     expect(roomManagerService.isNameTaken$).toHaveBeenCalled();
    //     expect(result).toEqual({ nameTaken: true });
    // });
});
