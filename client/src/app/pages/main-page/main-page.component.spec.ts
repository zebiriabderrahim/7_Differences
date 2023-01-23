import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
// import { CommunicationService } from '@app/services/communication.service';
// import { of, throwError } from 'rxjs';
// import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    // let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        // communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        // communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        // communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [MainPageComponent],
            providers: [],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // TODO: Les tests doivent être améliorés er bien représentés

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'Rat-Coon'", () => {
        expect(component.gameTitle).toEqual('Rat-Coon');
    });

    it("should have as team number '101'", () => {
        expect(component.teamNumber).toEqual('#101');
    });

    it("button 'Selection' should redirect correctly", () => {
        expect(component.selectionRoute).toEqual('/selection');
    });

    it("button 'Configuration' should redirect correctly", () => {
        expect(component.configRoute).toEqual('/config');
    });

    it("button 'Jouer' should redirect correctly", () => {
        expect(component.gameRoute).toEqual('/game');
    });
});
