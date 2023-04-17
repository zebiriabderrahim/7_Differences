import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
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
    let mockIsReloadNeeded: Subject<boolean>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        mockGameHistory = new Subject<GameHistory[]>();
        mockIsReloadNeeded = new Subject<boolean>();
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['loadGameHistory']);
        communicationServiceSpy.loadGameHistory.and.returnValue(mockGameHistory.asObservable());
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['gamesHistoryDeleted'], {
            isGameHistoryReloadNeeded$: mockIsReloadNeeded.asObservable(),
        });

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatButtonToggleModule, MatIconModule],
            declarations: [HistoryBoxComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: RoomManagerService, useValue: roomManagerServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
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

    it('handleHistoryUpdate should call loadHistory when isGameHistoryReloadNeeded is true', () => {
        component.handleHistoryUpdate();
        mockIsReloadNeeded.next(true);
        component.handleHistoryUpdate();
        expect(communicationServiceSpy.loadGameHistory).toHaveBeenCalled();
    });

    it('openConfirmationDialog should call dialog.open', () => {
        component.openConfirmationDialog();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });
});
