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
// import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { routes } from '@app/modules/app-routing.module';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
// import { of } from 'rxjs';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    // let gameCardService: ClassicSystemService;
    // let communicationService: CommunicationService;
    // let router: Router;
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
        component = fixture.componentInstance;
        // gameCardService = TestBed.inject(ClassicSystemService);
        // communicationService = TestBed.inject(CommunicationService);
        // router = TestBed.inject(Router);
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

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // TODO : Fix this test
    // it('OpenDialog should open dialog box and call gameCardService with game id and name', () => {
    //     const gameServicePlayerNameSpy = spyOn(gameCardService['playerName'], 'next');
    //     const gameServicePlayerIdSpy = spyOn(gameCardService['id'], 'next');
    //     const popUpSpy = spyOn(component.dialog, 'open').and.returnValue({
    //         afterClosed: () => of('test'),
    //     } as MatDialogRef<PlayerNameDialogBoxComponent>);
    //     component.openDialog();
    //     expect(popUpSpy).toHaveBeenCalled();
    //     expect(gameServicePlayerNameSpy).toHaveBeenCalledWith(component.game.name);
    //     expect(gameServicePlayerIdSpy).toHaveBeenCalledWith(component.game._id);
    // });

    // it('should open MatDialog pop up and redirect to game', () => {
    //     const popUpSpy = spyOn(component, 'openDialog').and.returnValue({
    //         afterClosed: () => of('test'),
    //     } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);

    //     component.playSolo();
    //     expect(popUpSpy).toHaveBeenCalled();
    // });

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

    // it('should call deleteGameById method of communicationService and redirect to config page', () => {
    //     const deleteGameByIdSpy = spyOn(communicationService, 'deleteGameById').and.returnValue(of());
    //     component.deleteGameCard();
    //     expect(deleteGameByIdSpy).toHaveBeenCalledWith(component.game._id);
    // });

    // it('should call deleteGameById method of communicationService and redirect to config page', () => {
    //     spyOn(communicationService, 'deleteGameById').and.returnValue(of(void 0));
    //     routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
    //     component.deleteGameCard();
    //     expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    // });

    // it('createSoloRoom should call openDialog ', () => {
    //     const openDialogSpy = spyOn(component, 'openDialog').and.returnValue({
    //         afterClosed: () => of('test'),
    //     } as MatDialogRef<PlayerNameDialogBoxComponent, unknown>);
    //     component.createSoloRoom();
    //     expect(openDialogSpy).toHaveBeenCalled();
    // });
});
