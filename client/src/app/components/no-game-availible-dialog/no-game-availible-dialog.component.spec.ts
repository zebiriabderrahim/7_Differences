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
