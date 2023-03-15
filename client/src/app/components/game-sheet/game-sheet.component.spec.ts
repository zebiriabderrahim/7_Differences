// Needed for functions mock
/* eslint-disable @typescript-eslint/no-empty-function */
// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameSheetComponent } from '@app/components/game-sheet/game-sheet.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { routes } from '@app/modules/app-routing.module';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { of } from 'rxjs';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    let communicationService: CommunicationService;
    let roomManagerService: RoomManagerService;
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), BrowserAnimationsModule, MatDialogModule, HttpClientTestingModule],
            declarations: [GameSheetComponent],
            providers: [
                CommunicationService,
                {
                    provide: ClassicSystemService,
                    // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for fake
                    useValue: {
                        playerName: { next: () => {} },
                        id: { next: () => {} },
                        manageSocket: () => {},
                        checkIfOneVsOneIsAvailable: () => {},
                        disconnect: () => {},
                    },
                    // TODO : Fix this freaking mess
                },
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
                {
                    provide: MatDialog,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
                {
                    provide: Router,
                    useValue: routerSpy,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSheetComponent);
        communicationService = TestBed.inject(CommunicationService);
        roomManagerService = TestBed.inject(RoomManagerService);
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

        spyOn(roomManagerService, 'handleRoomEvents').and.callFake(() => {});
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update isAvailable when the room availability changes', () => {
        spyOn(roomManagerService, 'checkRoomOneVsOneAvailability').and.callFake(() => {});
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component, 'roomAvailabilitySubscription' as any).and.callFake(() => {
            return {
                pipe: () => {
                    return {
                        subscribe: () => {
                            component['isAvailable'] = true;
                        },
                    };
                },
            };
        });
        component.ngOnInit();
        expect(roomManagerService.checkRoomOneVsOneAvailability).toHaveBeenCalledWith('0');
        expect(component['isAvailable']).toBeTrue();
    });

    // TODO : Fix this test
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
        const popUpSpy = spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);

        component.playSolo();
        expect(popUpSpy).toHaveBeenCalled();
    });

    /*
    it('should open MatDialog pop up and redirect host to waitingRoom ', () => {
        const gameListSpy = spyOn(component, 'createOneVsOne').and.callFake(() => {});
        const popUpSpy = spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);

        component.createOneVsOne();
        expect(popUpSpy).toHaveBeenCalled();
        expect(gameListSpy).toHaveBeenCalled();
    });*/

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
        spyOn(roomManagerService, 'updateRoomOneVsOneAvailability').and.callFake(() => {
            component.game._id = '0';
        });
        const openDialogSpy = spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component.createOneVsOne();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('createOneVsOne should call updateRoomOneVsOneAvailability if a player unsubscribe a game', () => {
        const roomManagerServiceSPy = spyOn(roomManagerService, 'updateRoomOneVsOneAvailability').and.callFake(() => {
            component.game._id = '1';
        });
        spyOn(component, 'openDialog').and.returnValue({
            afterClosed: () => of(''),
        } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
        component.createOneVsOne();
        expect(roomManagerServiceSPy).toHaveBeenCalled();
    });

    it('Should return true if the game is available', () => {
        const isAvailableToJoin = component.isAvailableToJoin();

        expect(component['isAvailable']).toEqual(isAvailableToJoin);
    });
});
