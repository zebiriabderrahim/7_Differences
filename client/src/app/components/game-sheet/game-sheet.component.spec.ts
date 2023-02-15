import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { of } from 'rxjs';
import { GameSheetComponent } from './game-sheet.component';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    let gameCardService: ClassicSystemService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, BrowserAnimationsModule, MatDialogModule],
            declarations: [GameSheetComponent],
            providers: [
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
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameCardService = TestBed.inject(ClassicSystemService);
        component.game = {
            id: '',
            name: 'test',
            difficultyLevel: true,
            soloTopTime: [],
            oneVsOneTopTime: [],
            thumbnail: '',
        };
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
        expect(gameServicePlayerIdSpy).toHaveBeenCalledWith(component.game.id);
    });
});
