import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoGameAvailibleDialogComponent } from './no-game-availible-dialog.component';

describe('NoGameAvailibleDialogComponent', () => {
    let component: NoGameAvailibleDialogComponent;
    let fixture: ComponentFixture<NoGameAvailibleDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [NoGameAvailibleDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(NoGameAvailibleDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
