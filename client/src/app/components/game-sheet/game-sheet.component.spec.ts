// Needed for functions mock
/* eslint-disable @typescript-eslint/no-empty-function */
// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameSheetComponent } from '@app/components/game-sheet/game-sheet.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { BehaviorSubject, of, Subject, Subscription } from 'rxjs';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let roomIdSpy: Subject<string>;
    let communicationService: CommunicationService;

    beforeEach(async () => {
        roomIdSpy = new Subject<string>();
        roomManagerServiceSpy = jasmine.createSpyObj(
            'RoomManagerService',
            [
                'updateRoomOneVsOneAvailability',
                'handleRoomEvents',
                'checkRoomOneVsOneAvailability',
                'disconnect',
                'deleteCreatedOneVsOneRoom',
                'createOneVsOneRoom',
                'createSoloRoom',
                'updateWaitingPlayerNameList',
                'gameCardDeleted',
            ],
            {
                roomId$: roomIdSpy,
                oneVsOneRoomsAvailabilityByRoomId$: new BehaviorSubject({
                    gameId: '0',
                    isAvailableToJoin: true,
                }),
            },
        );
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), BrowserAnimationsModule, MatDialogModule, HttpClientTestingModule],
            declarations: [GameSheetComponent],
            providers: [
                CommunicationService,
                {
                    provide: MatDialog,
                },
                {
                    provide: Router,
                    useValue: routerSpy,
                },
                {
                    provide: RoomManagerService,
                    useValue: roomManagerServiceSpy,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSheetComponent);
        communicationService = TestBed.inject(CommunicationService);
        component = fixture.componentInstance;

        component.game = {
            _id: '0',
            name: 'test',
            difficultyLevel: true,
            soloTopTime: [],
            oneVsOneTopTime: [],
            thumbnail: '',
        };
        fixture.detectChanges();
    });

    it('should update isAvailable when the room availability changes', () => {
        expect(roomManagerServiceSpy.checkRoomOneVsOneAvailability).toHaveBeenCalledWith(component.game._id);
    });

    it('OpenDialog should open dialog box and call gameCardService with game id and name', () => {
        const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component.openDialog();

        expect(dialogSpy).toHaveBeenCalledWith(PlayerNameDialogBoxComponent, {
            data: { gameId: component.game._id },
            disableClose: true,
        });
    });

    it('should open MatDialog pop up and redirect to game', () => {
        const roomId = 'test-room-id';
        roomIdSpy.next(roomId);
        component.playSolo();
        roomIdSpy.next(roomId);
        expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should call deleteGameById method of communicationService and redirect to config page', () => {
        const deleteGameByIdSpy = spyOn(communicationService, 'deleteGameById').and.returnValue(of());
        component.deleteGameCard();
        expect(deleteGameByIdSpy).toHaveBeenCalledWith(component.game._id);
    });

    it('should call deleteGameById method of communicationService and redirect to config page', () => {
        spyOn(communicationService, 'deleteGameById').and.returnValue(of(void 0));
        routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
        component.deleteGameCard();
        expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    });

    it('createSoloRoom should call openDialog ', () => {
        const openDialogSpy = spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component.createSoloRoom();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('createOneVsOne should call createOneVsOneRoom and openWaitingDialog if a player create a game ', () => {
        roomManagerServiceSpy.updateRoomOneVsOneAvailability.and.callFake(() => {
            component.game._id = '0';
        });
        const openDialogSpy = spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component.createOneVsOne();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('createOneVsOne should call updateRoomOneVsOneAvailability if a player unsubscribe a game', () => {
        spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of(''),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component.createOneVsOne();
        expect(roomManagerServiceSpy.updateRoomOneVsOneAvailability).toHaveBeenCalled();
    });

    it('joinOneVsOne should call updateWaitingPlayerNameList if a player2 subscribe a game', () => {
        spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of('Alice'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component.joinOneVsOne();
        expect(roomManagerServiceSpy.updateWaitingPlayerNameList).toHaveBeenCalled();
    });

    it('openWaitingDialog should open dialog if a player2 waiting to join a game', () => {
        const dialogSpy = spyOn(component['dialog'], 'open');
        roomIdSpy.next('0');
        spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component.openWaitingDialog('test');
        roomIdSpy.next('0');
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('Should return true if the game is available', () => {
        const isAvailableToJoin = component.isAvailableToJoin();
        expect(component['isAvailable']).toEqual(isAvailableToJoin);
    });

    it('this.roomAvailabilitySubscription?.unsubscribe() should ne call if undefined', () => {
        component['roomAvailabilitySubscription'] = undefined as unknown as Subscription;
        const mockSubscription = new Subscription();
        component['roomIdSubscription'] = mockSubscription;
        const unsubscribeSpy = spyOn(component['roomIdSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });
});
