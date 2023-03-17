import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { WaitingPlayerNameList } from '@common/game-interfaces';
import { Subject } from 'rxjs';
import { JoinedPlayerDialogComponent } from './joined-player-dialog.component';

describe('JoinedPlayerDialogComponent', () => {
    let component: JoinedPlayerDialogComponent;
    let fixture: ComponentFixture<JoinedPlayerDialogComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let joinedPlayerNamesMock: Subject<WaitingPlayerNameList>;

    beforeEach(async () => {
        joinedPlayerNamesMock = new Subject<WaitingPlayerNameList>();
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', [], { joinedPlayerNamesByGameId$: joinedPlayerNamesMock.asObservable() });
        await TestBed.configureTestingModule({
            declarations: [JoinedPlayerDialogComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { gameId: 'game123', player: 'testPlayer' } },
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: MatDialogRef, useValue: { close: () => {} } },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinedPlayerDialogComponent);
        // roomManagerService = TestBed.inject(RoomManagerService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should handle refused player and accepted player', () => {
    //     const mockData = { gameId: 'game123', playerNamesList: ['player1', 'player2'] };
    //     // expect(component['data']).toBeNull();
    //     const spyPipe = spyOn(roomManagerServiceSpy.joinedPlayerNamesByGameId$, 'pipe').and.returnValue(joinedPlayerNamesMock);
    //     component.getJoinedPlayerNamesByGameId();
    //     // joinedPlayerNamesMock.next(mockData);
    //     // joinedPlayerNamesMock.next(mockData);

    //     spyOn(component, 'handleRefusedPlayer');
    //     spyOn(component, 'handleAcceptedPlayer');
    //     expect(spyPipe).toHaveBeenCalled();
    //     expect(component.handleRefusedPlayer).toHaveBeenCalledWith(mockData.playerNamesList);
    //     expect(component.handleAcceptedPlayer).toHaveBeenCalled();
    // });

    // it('should filter player names by game id', () => {
    // arrange
    // const gameId = 'game1';
    // const player = 'player1';
    // const joinedPlayerNamesByGameId$ = new BehaviorSubject({
    //     gameId,
    //     playerNamesList: ['player1', 'player2'],
    // });
    // const predicateFn = (data: any) => data.gameId === 'myGameId' && !!data.playerNamesList;
    // spyOn(filter, 'filter')
    // const filterSpy = spyOn(rxjs, 'filter').and.callFake((predicate: (value: any, index: number) => boolean) => {
    //     return filter((data) => predicateFn(data));
    // });
    // component['data'] = { gameId, player };

    // // act
    // component.getJoinedPlayerNamesByGameId();
    // joinedPlayerNamesByGameId$.next({
    //     gameId,
    //     playerNamesList: ['player1', 'player2'],

    // assert
    // expect(filterSpy).toHaveBeenCalledWith(
    //     jasmine.any(Function), // This checks if the filter function is passed in as an argument
    // );
    //     const gameId = '123';
    //     component['data'] = { gameId, player: 'player1' };
    //     const playerNamesList = ['player1', 'player2'];

    //     // Spy on roomManagerService
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const joinedPlayerNamesByGameIdSpy = spyOn(roomManagerService, 'joinedPlayerNamesByGameId$' as any).and.returnValue(
    //         of({ gameId, playerNamesList }),
    //     );

    //     // Call method
    //     component.getJoinedPlayerNamesByGameId();

    //     // Expectations
    //     expect(joinedPlayerNamesByGameIdSpy).toHaveBeenCalled();
    //     expect(joinedPlayerNamesByGameIdSpy).toHaveBeenCalledTimes(1);

    //     // Wait for observable to emit before testing filter
    //     joinedPlayerNamesByGameIdSpy.and.returnValue(of({ gameId, playerNamesList }).pipe(delay(0)));
    //     fixture.detectChanges();

    //     expect(component.getJoinedPlayerNamesByGameId).toBeDefined();

    //     const filterSpy = spyOn('filter').and.callThrough();
    //     const expectedParameter = { gameId, playerNamesList };
    //     const expectedReturnValue = gameId === component['data'].gameId && !!playerNamesList;

    //     expect(filterSpy).toHaveBeenCalledWith(expectedParameter);
    //     expect(filterSpy).toHaveBeenCalledTimes(1);
    // });

    // it('should handle refused player and accepted player', () => {
    //     const mockData = { gameId: 'game123', playerNamesList: ['player1', 'player2'] };
    //     // expect(component['data']).toBeNull();
    //     const spyPipe = spyOn(roomManagerService.joinedPlayerNamesByGameId$, 'pipe').and.returnValue(
    //         of(mockData).pipe(filter((data) => data.gameId === 'game123' && !!data.playerNamesList)),
    //     );
    //     component.getJoinedPlayerNamesByGameId();
    //     spyOn(component, 'handleRefusedPlayer');
    //     spyOn(component, 'handleAcceptedPlayer');
    //     expect(spyPipe).toHaveBeenCalled();
    //     expect(component.handleRefusedPlayer).toHaveBeenCalledWith(mockData.playerNamesList);
    //     expect(component.handleAcceptedPlayer).toHaveBeenCalled();
    // });
});
