import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoGameAvailableDialogComponent } from '@app/components/no-game-available-dialog/no-game-available-dialog.component';

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

    it('gotoHome should navigate to home', () => {
        const navigateSpy = spyOn(component.router, 'navigate');
        component.goToHome();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('goToCreate should navigate to create', () => {
        const navigateSpy = spyOn(component.router, 'navigate');
        component.goToCreate();
        expect(navigateSpy).toHaveBeenCalledWith(['/create']);
    });
});
