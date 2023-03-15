import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
// import { ClientSideGame } from '@common/game-interfaces';
// import { Subject } from 'rxjs';
import { SoloGameViewComponent } from './solo-game-view.component';

describe('SoloGameViewComponent', () => {
    let component: SoloGameViewComponent;
    let fixture: ComponentFixture<SoloGameViewComponent>;
    let mouse: MouseEvent;
    let gameAreaService: GameAreaService;
    let classicService: ClassicSystemService;
    // const clientSideGameTest: ClientSideGame = {
    //     id: '1',
    //     name: 'test',
    //     player: 'test',
    //     mode: 'test',
    //     isHard: true,
    //     original: 'test',
    //     modified: 'test',
    //     differencesCount: 1,
    // };
    // const timerTest = 1;
    // const differencesFoundTest = 7;

    // const clientSideGameSubjectTest = new Subject<ClientSideGame>();
    // const timerSubjectTest = new Subject<number>();
    // const differencesFoundSubjectTest = new Subject<number>();

    // let classicServiceGetCurrentGameSpy: () => Subject<ClientSideGame>;
    // let classicServiceGetTimerSpy: () => Subject<number>;
    // let classicServiceGetDifferencesFoundSpy: () => Subject<number>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [SoloGameViewComponent],
            providers: [GameAreaService, ClassicSystemService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SoloGameViewComponent);
        component = fixture.componentInstance;
        gameAreaService = TestBed.inject(GameAreaService);
        classicService = TestBed.inject(ClassicSystemService);
        fixture.detectChanges();
        // classicServiceGetCurrentGameSpy = spyOn(classicService, 'getCurrentGame').and.callFake(() => {
        //     return clientSideGameSubjectTest;
        // });
        // classicServiceGetTimerSpy = spyOn(classicService, 'getTimer').and.callFake(() => {
        //     return timerSubjectTest;
        // });
        // classicServiceGetDifferencesFoundSpy = spyOn(classicService, 'getDifferencesFound').and.callFake(() => {
        //     return differencesFoundSubjectTest;
        // });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should call manageSocket() from the classicService when the view is instantiated', () => {
    //     const manageSocketSpy = spyOn(classicService, 'manageSocket');
    //     expect(manageSocketSpy).not.toHaveBeenCalled();
    //     component.ngAfterViewInit();
    //     expect(manageSocketSpy).toHaveBeenCalled();
    // });

    // it('should define the game when the view is instantiated', () => {
    //     expect(component.game).not.toBeDefined();
    //     expect(classicServiceGetCurrentGameSpy).not.toHaveBeenCalled();
    //     component.ngAfterViewInit();
    //     clientSideGameSubjectTest.next(clientSideGameTest);
    //     expect(classicServiceGetCurrentGameSpy).toHaveBeenCalled();
    //     expect(component.game).toBeDefined();
    // });

    // it('should set the game canvas when the view is instantiated', () => {
    //     const setOgContext = spyOn(gameAreaService, 'setOgContext');
    //     const setMdContext = spyOn(gameAreaService, 'setMdContext');
    //     const setOgFrontContext = spyOn(gameAreaService, 'setOgFrontContext');
    //     const setMdFrontContext = spyOn(gameAreaService, 'setMdFrontContext');
    //     const loadImage = spyOn(gameAreaService, 'loadImage');
    //     const setAllData = spyOn(gameAreaService, 'setAllData');

    //     component.ngAfterViewInit();
    //     clientSideGameSubjectTest.next(clientSideGameTest);
    //     expect(setOgContext).toHaveBeenCalled();
    //     expect(setMdContext).toHaveBeenCalled();
    //     expect(setOgFrontContext).toHaveBeenCalled();
    //     expect(setMdFrontContext).toHaveBeenCalled();
    //     expect(loadImage).toHaveBeenCalled();
    //     expect(setAllData).toHaveBeenCalled();
    // });

    // it('should update the timer', () => {
    //     expect(component.timer).toEqual(0);
    //     expect(classicServiceGetTimerSpy).not.toHaveBeenCalled();
    //     component.ngAfterViewInit();
    //     timerSubjectTest.next(timerTest);
    //     expect(classicServiceGetTimerSpy).toHaveBeenCalled();
    //     expect(component.timer).toEqual(timerTest);
    // });

    // it('should update the differences found', () => {
    //     expect(component.differencesFound).toEqual(0);
    //     expect(classicServiceGetDifferencesFoundSpy).not.toHaveBeenCalled();
    //     component.ngAfterViewInit();
    //     differencesFoundSubjectTest.next(differencesFoundTest);
    //     expect(classicServiceGetDifferencesFoundSpy).toHaveBeenCalled();
    //     expect(component.differencesFound).toEqual(differencesFoundTest);
    // });

    it('should open a dialog when the abandon game button is pressed', () => {
        const abandonGameDialogSpy = spyOn(classicService, 'showAbandonGameDialog');
        expect(abandonGameDialogSpy).not.toHaveBeenCalled();
        component.abandonGame();
        expect(abandonGameDialogSpy).toHaveBeenCalled();
    });

    it('should do nothing if the left click on original image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnOriginal(mouse);
        expect(classicService['isLeftCanvas']).toBeFalsy();
    });

    it('should set isLeftCanvas to true if the left click on original image is detected', () => {
        const gameAreaSpy = spyOn(gameAreaService, 'setAllData');
        const classicServiceSpy = spyOn(classicService, 'requestVerification');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnOriginal(mouse);
        expect(classicService['isLeftCanvas']).toBeTruthy();
        expect(gameAreaSpy).toHaveBeenCalled();
        expect(classicServiceSpy).toBeTruthy();
    });

    it('should do nothing if the left click on modified image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnModified(mouse);
        expect(classicService['isLeftCanvas']).toBeFalsy();
    });

    it('should set isLeftCanvas to false if the left click on modified image is detected', () => {
        const gameAreaSpy = spyOn(gameAreaService, 'setAllData');
        const classicServiceSpy = spyOn(classicService, 'requestVerification');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnModified(mouse);
        expect(classicService['isLeftCanvas']).toBeFalsy();
        expect(gameAreaSpy).toHaveBeenCalled();
        expect(classicServiceSpy).toBeTruthy();
    });
});
