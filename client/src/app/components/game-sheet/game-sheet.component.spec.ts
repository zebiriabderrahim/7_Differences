// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { of } from 'rxjs';
import { GameSheetComponent } from './game-sheet.component';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    let gameCardService: ClassicSystemService;
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, BrowserAnimationsModule, MatDialogModule, HttpClientTestingModule],
            declarations: [GameSheetComponent],
            providers: [
                CommunicationService,
                {
                    provide: ClassicSystemService,
                    // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for fake
                    useValue: { playerName: { next: () => {} }, id: { next: () => {} } },
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
        gameCardService = TestBed.inject(ClassicSystemService);
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('OpenDialog should open dialog box and call gameCardService with game id and name', () => {
        const gameServicePlayerNameSpy = spyOn(gameCardService['playerName'], 'next');
        const gameServicePlayerIdSpy = spyOn(gameCardService['id'], 'next');
        const popUpSpy = spyOn(component.dialog, 'open').and.returnValue({
            afterClosed: () => of('test'),
        } as MatDialogRef<PlayerNameDialogBoxComponent>);
        component.openDialog();
        expect(popUpSpy).toHaveBeenCalled();
        expect(gameServicePlayerNameSpy).toHaveBeenCalledWith(component.game.name);
        expect(gameServicePlayerIdSpy).toHaveBeenCalledWith(component.game._id);
    });

    it('should call deleteGameById method of communicationService and redirect to config page', () => {
        const deleteGameByIdSpy = spyOn(component['communicationService'], 'deleteGameById').and.callFake((id: '0') => {
            expect(id).toEqual('0');
            expect(routerSpy.navigateByUrl).toHaveBeenCalled();
            return of();
        });
        component.deleteGameCard();
        expect(deleteGameByIdSpy).toHaveBeenCalled();
    });
});
