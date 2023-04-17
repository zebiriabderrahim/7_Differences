import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoGameAvailableDialogComponent } from './no-game-available-dialog.component';

describe('NoGameAvailableDialogComponent', () => {
    let component: NoGameAvailableDialogComponent;
    let fixture: ComponentFixture<NoGameAvailableDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [NoGameAvailableDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(NoGameAvailableDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
