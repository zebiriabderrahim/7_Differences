import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';
import { PlayerNameDialogBoxComponent } from '../player-name-dialog-box/player-name-dialog-box.component';
import { GameSheetComponent } from './game-sheet.component';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
            declarations: [GameSheetComponent, PlayerNameDialogBoxComponent],
            providers: [CommunicationService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSheetComponent);
        component = fixture.componentInstance;
        dialog = TestBed.inject(MatDialog);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change the values of buttonPlay and ButtonJoin when url is /selection', () => {
        spyOnProperty(component.router, 'url').and.returnValue('/selection');
        component.navigate();
        expect(component.buttonJoin).toEqual('Joindre');
        expect(component.buttonPlay).toEqual('Jouer');
    });

    it('should open the dialog', () => {
        spyOn(dialog, 'open');
        component.openDialog();
        expect(dialog.open).toHaveBeenCalled();
    });

    it('should call gameCard.redirection when a player name is not an empty string', () => {});

    it('should not call gameCard.redirection when player name is an empty string', () => {});
});
