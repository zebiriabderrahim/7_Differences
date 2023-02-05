import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';

import { SoloGameViewComponent } from './solo-game-view.component';

describe('SoloGameViewComponent', () => {
    let component: SoloGameViewComponent;
    let fixture: ComponentFixture<SoloGameViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [SoloGameViewComponent],
            providers: [CommunicationService, HttpClient, HttpHandler],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloGameViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
