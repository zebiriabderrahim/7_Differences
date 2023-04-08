/* eslint-disable @typescript-eslint/no-magic-numbers -- needed for tests*/
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigDialogComponent } from '@app/components/config-dialog/config-dialog.component';
import { DeleteResetConfirmationDialogComponent } from '@app/components/delete-reset-confirmation-dialog/delete-reset-confirmation-dialog.component';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { Actions } from '@app/enum/delete-reset-actions';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { ConfigPageComponent } from './config-page.component';

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatGridListModule,
                MatDialogModule,
                MatExpansionModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatIconModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatDialogModule,
            ],
            declarations: [ConfigPageComponent, SelectionPageComponent, NavBarComponent],
            providers: [CommunicationService, RoomManagerService, { provide: MatDialog, useValue: dialogSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openConfirmationDialog should open the confirmation dialog', () => {
        const action = {} as Actions;
        component.openConfirmationDialog(action);
        expect(dialogSpy.open).toHaveBeenCalledWith(DeleteResetConfirmationDialogComponent, {
            data: { actions: action },
            disableClose: true,
        });
    });

    it('openConfigDialog should open the dialog with the ConfigDialogComponent and call afterClosed()', () => {
        component.openConfigDialog();
        expect(dialogSpy.open).toHaveBeenCalledWith(ConfigDialogComponent, jasmine.anything());
    });
});
