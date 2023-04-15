import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameModes } from '@common/enums';
import { of } from 'rxjs';
import { LimitedTimePageComponent } from './limited-time-page.component';

describe('LimitedTimePageComponent', () => {
    let component: LimitedTimePageComponent;
    let fixture: ComponentFixture<LimitedTimePageComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['createLimitedRoom', 'checkIfAnyCoopRoomExists'], {
            createdRoomId$: of('test-room-id'),
        });
        await TestBed.configureTestingModule({
            declarations: [LimitedTimePageComponent, PlayerNameDialogBoxComponent, NavBarComponent],
            imports: [
                RouterTestingModule,
                MatDialogModule,
                BrowserAnimationsModule,
                MatFormFieldModule,
                MatInputModule,
                ReactiveFormsModule,
                MatIconModule,
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('playLimited should return early if game is already starting', () => {
        spyOn(component, 'redirectToGamePage');
        component['isStartingGame'] = true;
        const gameMode = GameModes.LimitedSolo;
        component.playLimited(gameMode);
        expect(roomManagerServiceSpy.createLimitedRoom).not.toHaveBeenCalled();
        expect(roomManagerServiceSpy.checkIfAnyCoopRoomExists).not.toHaveBeenCalled();
        expect(component.redirectToGamePage).not.toHaveBeenCalled();
    });

    it('playLimited should call createLimitedRoom and redirectToGamePage for LimitedSolo game mode', () => {
        spyOn(component, 'redirectToGamePage');
        const gameMode = GameModes.LimitedSolo;
        component.playLimited(gameMode);
        expect(component['isStartingGame']).toBe(true);
        expect(component.redirectToGamePage).toHaveBeenCalledWith(gameMode);
    });

    it('playLimited should call checkIfAnyCoopRoomExists and redirectToGamePage for LimitedCoop game mode', () => {
        spyOn(component, 'redirectToGamePage');
        const gameMode = GameModes.LimitedCoop;
        component.playLimited(gameMode);
        expect(component['isStartingGame']).toBe(true);
        expect(component.redirectToGamePage).toHaveBeenCalledWith(gameMode);
    });

    it('redirectToGamePage should not navigate or open dialog when game mode is LimitedCoop but a limited coop room is available', () => {
        spyOn(component, 'openWaitingDialog');
        component['isLimitedCoopRoomAvailable'] = true;
        component.redirectToGamePage(GameModes.LimitedCoop);
        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(component.openWaitingDialog).not.toHaveBeenCalled();
        expect(component['isStartingGame']).toEqual(false);
    });

    it('openWaitingDialog should open dialog', () => {
        const mockRoomId = 'test-room-id';
        const dialogOpenSpy = spyOn(component['dialog'], 'open').and.callThrough();
        component.openWaitingDialog(mockRoomId);
        expect(dialogOpenSpy).toHaveBeenCalled();
    });
});
