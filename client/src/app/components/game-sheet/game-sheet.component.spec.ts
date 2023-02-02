import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';
import { GameCardService } from '@app/services/gamecard-service/gamecard.service';
import { GameSheetComponent } from './game-sheet.component';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;
    let dialog: MatDialog;
    let router: Router;
    let location: Location;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), MatDialogModule],
            declarations: [GameSheetComponent, PlayerNameDialogBoxComponent],
            providers: [CommunicationService, GameCardService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSheetComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        dialog = jasmine.createSpyObj('MatDialog', ['open']);
        fixture.detectChanges();
        router.initialNavigation();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('navigate should redirects you to /selection', () => {
        router.navigate(['selection']);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(location.path()).toEqual('/selection');
        });
    });

    it('should change the values of buttonPlay and ButtonJoin when url is /selection', () => {
        spyOnProperty(component.router, 'url').and.returnValue('/selection');
        component.navigate();
        expect(component.buttonJoin).toEqual('Joindre');
        expect(component.buttonPlay).toEqual('Jouer');
    });

    /* it('should open the dialog if router url is /selection', () => {
        const navigateSpy = spyOn(component.router, 'navigate');
        component.router.navigate(['selection']);
        component.openDialog();
        expect(navigateSpy).toHaveBeenCalledWith(['selection']);
        expect(dialog.open).toHaveBeenCalledWith(PlayerNameDialogBoxComponent, {
            data: { disableClose: false },
        });
    }); */

    it('should not open dialog if router url is not /selection', () => {
        component.router.navigate(['selection']);
        component.openDialog();
        expect(dialog.open).not.toHaveBeenCalled();
    });
});
