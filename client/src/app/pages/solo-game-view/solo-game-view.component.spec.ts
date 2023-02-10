import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';

import { SoloGameViewComponent } from './solo-game-view.component';

describe('SoloGameViewComponent', () => {
    let component: SoloGameViewComponent;
    let fixture: ComponentFixture<SoloGameViewComponent>;
    let mouse: MouseEvent;
    let gameArea: GameAreaService;
    let classicService: ClassicSystemService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [SoloGameViewComponent],
            providers: [CommunicationService, HttpClient, HttpHandler, GameAreaService],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloGameViewComponent);
        component = fixture.componentInstance;
        gameArea = TestBed.inject(GameAreaService);
        classicService = TestBed.inject(ClassicSystemService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should do nothing if the left click on original image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnOriginal(mouse);
        expect(component.isLeftCanvas).toBeFalsy();
    });

    it('should set isLeftCanvas to true if the left click on original image is detected', () => {
        const gameAreaSpy = spyOn(gameArea, 'setAllData');
        const classicServiceSpy = spyOn(classicService, 'requestVerification');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnOriginal(mouse);
        expect(classicService.isLeftCanvas).toBeTruthy();
        expect(gameAreaSpy).toHaveBeenCalled();
        expect(classicServiceSpy).toBeTruthy();
    });

    it('Should do nothing if the left click on modified image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnModified(mouse);
        expect(component.isLeftCanvas).toBeFalsy();
    });

    it('should set isLeftCanvas to true if the left click on modified image is detected', () => {
        const gameAreaSpy = spyOn(gameArea, 'setAllData');
        const classicServiceSpy = spyOn(classicService, 'requestVerification');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnModified(mouse);
        expect(classicService.isLeftCanvas).toBeFalsy();
        expect(gameAreaSpy).toHaveBeenCalled();
        expect(classicServiceSpy).toBeTruthy();
    });
});
