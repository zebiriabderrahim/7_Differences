import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameHistory } from '@common/game-interfaces';
import { Subject } from 'rxjs';
import { HistoryBoxComponent } from './history-box.component';

describe('HistoryBoxComponent', () => {
    let component: HistoryBoxComponent;
    let fixture: ComponentFixture<HistoryBoxComponent>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let mockGameHistory: Subject<GameHistory[]>;
    let mockDeleteAllGames: Subject<void>;
    let mockIsReloadNeeded: Subject<boolean>;

    beforeEach(async () => {
        mockGameHistory = new Subject<GameHistory[]>();
        mockDeleteAllGames = new Subject<void>();
        mockIsReloadNeeded = new Subject<boolean>();
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['loadGameHistory', 'deleteAllGamesHistory']);
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['gamesHistoryDeleted'], {
            isGameHistoryReloadNeeded$: mockIsReloadNeeded.asObservable(),
        });
        communicationServiceSpy.loadGameHistory.and.returnValue(mockGameHistory.asObservable());
        communicationServiceSpy.deleteAllGamesHistory.and.returnValue(mockDeleteAllGames.asObservable());

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatButtonToggleModule],
            declarations: [HistoryBoxComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HistoryBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('loadHistory should call communicationService.loadGameHistory', () => {
        mockGameHistory.next([]);
        expect(communicationServiceSpy.loadGameHistory).toHaveBeenCalled();
    });

    it('deleteAllGamesHistory should call roomManager.gamesHistoryDeleted', () => {
        component.deleteAllGamesHistory();
        mockDeleteAllGames.next();
        component.deleteAllGamesHistory();
        expect(roomManagerServiceSpy.gamesHistoryDeleted).toHaveBeenCalled();
    });

    it('handleHistoryUpdate should call loadHistory when isGameHistoryReloadNeeded is true', () => {
        component.handleHistoryUpdate();
        mockIsReloadNeeded.next(true);
        component.handleHistoryUpdate();
        expect(communicationServiceSpy.loadGameHistory).toHaveBeenCalled();
    });
});
