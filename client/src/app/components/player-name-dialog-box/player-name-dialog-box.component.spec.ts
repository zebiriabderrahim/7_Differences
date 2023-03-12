import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PlayerNameDialogBoxComponent } from './player-name-dialog-box.component';

describe('PlayerNameDialogBoxComponent', () => {
    let component: PlayerNameDialogBoxComponent;
    let fixture: ComponentFixture<PlayerNameDialogBoxComponent>;
    let dialogRef: MatDialogRef<PlayerNameDialogBoxComponent, unknown>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [],
            providers: [
                { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
                { provide: MAT_DIALOG_DATA, useValue: { id: 1 } },
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

    it('should close the dialog closeModal', () => {
        component.closeModal();
        expect(dialogRef.close).toHaveBeenCalled();
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
});
