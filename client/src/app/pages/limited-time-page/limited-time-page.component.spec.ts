/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { routes } from '@app/modules/app-routing.module';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameModes } from '@common/enums';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { LimitedTimePageComponent } from './limited-time-page.component';

describe('LimitedTimePageComponent', () => {
    let component: LimitedTimePageComponent;
    let fixture: ComponentFixture<LimitedTimePageComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let createdRoomId: BehaviorSubject<string>;
    let isLimitedCoopRoomAvailable: BehaviorSubject<boolean>;
    let hasNoGameAvailable: BehaviorSubject<boolean>;
    let playerName: BehaviorSubject<string>;
    let roomLimitedId: BehaviorSubject<string>;

    beforeEach(async () => {
        createdRoomId = new BehaviorSubject<string>('test-room-id');
        playerName = new BehaviorSubject<string>('Alice');
        isLimitedCoopRoomAvailable = new BehaviorSubject<boolean>(true);
        hasNoGameAvailable = new BehaviorSubject<boolean>(true);
        roomLimitedId = new BehaviorSubject<string>('test-room-id');
        roomManagerServiceSpy = jasmine.createSpyObj(
            'RoomManagerService',
            ['createLimitedRoom', 'checkIfAnyCoopRoomExists', 'handleRoomEvents', 'removeAllListeners'],
            {
                createdRoomId$: createdRoomId,
                isLimitedCoopRoomAvailable$: isLimitedCoopRoomAvailable,
                hasNoGameAvailable$: hasNoGameAvailable,
                roomLimitedId$: roomLimitedId,
            },
        );
        await TestBed.configureTestingModule({
            declarations: [LimitedTimePageComponent, PlayerNameDialogBoxComponent, NavBarComponent],
            imports: [
                RouterTestingModule.withRoutes(routes),
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
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('playLimited should return early if game is already starting', () => {
        spyOn<any>(component, 'redirectToGamePage');
        component['isStartingGame'] = true;
        const gameMode = GameModes.LimitedSolo;
        component.playLimited(gameMode);
        expect(roomManagerServiceSpy.createLimitedRoom).not.toHaveBeenCalled();
        expect(roomManagerServiceSpy.checkIfAnyCoopRoomExists).not.toHaveBeenCalled();
        expect(component['redirectToGamePage']).not.toHaveBeenCalled();
    });

    it('playLimited should call createLimitedRoom and redirectToGamePage for LimitedSolo game mode', () => {
        spyOn<any>(component, 'redirectToGamePage');
        const gameMode = GameModes.LimitedSolo;
        component.playLimited(gameMode);
        expect(component['isStartingGame']).toBe(true);
        expect(component['redirectToGamePage']).toHaveBeenCalledWith(gameMode);
    });

    it('playLimited should call checkIfAnyCoopRoomExists and redirectToGamePage for LimitedCoop game mode', () => {
        spyOn<any>(component, 'redirectToGamePage');
        const gameMode = GameModes.LimitedCoop;
        component.playLimited(gameMode);
        expect(component['isStartingGame']).toBe(true);
        expect(component['redirectToGamePage']).toHaveBeenCalledWith(gameMode);
    });

    it('redirectToGamePage should not navigate or open dialog when game mode is LimitedCoop but a limited coop room is available', () => {
        spyOn<any>(component, 'openWaitingDialog');
        component['isLimitedCoopRoomAvailable'] = true;
        component['redirectToGamePage'](GameModes.LimitedCoop);
        expect(component['openWaitingDialog']).not.toHaveBeenCalled();
        expect(component['isStartingGame']).toEqual(false);
    });

    it('redirectToGamePage should not navigate to game page when game mode is LimitedCoop and a limited coop room is not available', () => {
        const roomId = 'test-room-id';
        isLimitedCoopRoomAvailable.next(false);
        component['redirectToGamePage'](GameModes.LimitedCoop);
        createdRoomId.next(roomId);
        expect(component['isStartingGame']).toEqual(false);
    });

    it('redirectToGamePage should  navigate to game page when game mode is LimitedCoop and a limited coop room is  available', () => {
        const roomId = 'test-room-id';
        const gameMode = GameModes.LimitedSolo;
        component['redirectToGamePage'](gameMode);
        isLimitedCoopRoomAvailable.next(true);
        createdRoomId.next(roomId);
        expect(component['isStartingGame']).toEqual(false);
    });

    it('openWaitingDialog should open dialog', () => {
        const mockRoomId = 'test-room-id';
        const dialogOpenSpy = spyOn(component['dialog'], 'open').and.callThrough();
        component['openWaitingDialog'](mockRoomId);
        expect(dialogOpenSpy).toHaveBeenCalled();
    });

    it('openDialog should open dialog and subscribe player', () => {
        component['openDialog']();
        playerName.next('Alice');
        const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component['openDialog']();

        expect(dialogSpy).toHaveBeenCalledWith(PlayerNameDialogBoxComponent, {
            disableClose: true,
            panelClass: 'dialog',
        });
    });

    it('should unsubscribe isLimitedCoopRoomAvailableSubscription when ngOndestroy is called', () => {
        component['isLimitedCoopRoomAvailableSubscription'] = undefined as unknown as Subscription;
        component.ngOnDestroy();
        expect(component['isLimitedCoopRoomAvailableSubscription']).toBeUndefined();
    });

    it('should unsubscribe hasNoGameAvailableSubscription when ngOndestroy is called', () => {
        component['hasNoGameAvailableSubscription'] = undefined as unknown as Subscription;
        component.ngOnDestroy();
        expect(component['hasNoGameAvailableSubscription']).toBeUndefined();
    });

    it('should unsubscribe roomIdSubscription when redirectToGamePage is called', () => {
        component['roomIdSubscription'] = new BehaviorSubject<string>('test-room-id').asObservable().subscribe();
        component['redirectToGamePage'](GameModes.LimitedSolo);
        expect(component['roomIdSubscription']).toBeDefined();
    });
});
