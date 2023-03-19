import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
// import { ClientSideGame } from '@common/game-interfaces';
// import { Subject } from 'rxjs';
import { SoloGameViewComponent } from '@app/pages/solo-game-view/solo-game-view.component';
import { Subscription } from 'rxjs';

describe('SoloGameViewComponent', () => {
    let component: SoloGameViewComponent;
    let fixture: ComponentFixture<SoloGameViewComponent>;
    let mouse: MouseEvent;
    let gameAreaService: GameAreaService;
    let classicService: ClassicSystemService;
    let dialog: jasmine.SpyObj<MatDialog>;
    let classicServiceSpy: jasmine.SpyObj<ClassicSystemService>;
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
        classicServiceSpy = jasmine.createSpyObj('ClassicService', ['sendMessage', 'requestVerification']);
        dialog = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [SoloGameViewComponent],
            providers: [GameAreaService, ClassicSystemService, { provide: MatDialog, useValue: dialog }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SoloGameViewComponent);
        component = fixture.componentInstance;
        gameAreaService = TestBed.inject(GameAreaService);
        classicService = TestBed.inject(ClassicSystemService);
        fixture.detectChanges();
        // dialog = TestBed.inject(MatDialog);
        // spyOn(dialog, 'open');
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

    /* it('should open a dialog when the abandon game button is pressed', () => {
        const abandonGameDialogSpy = spyOn(classicService, 'showAbandonGameDialog');
        expect(abandonGameDialogSpy).not.toHaveBeenCalled();
        component.showAbandonGameDialog();
        expect(abandonGameDialogSpy).toHaveBeenCalled();
    });*/

    it('should do nothing if the left click on original image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnCanvas(mouse, false);
        expect(classicService['isLeftCanvas']).toBeFalsy();
    });

    it('should set isLeftCanvas to true if the left click on original image is detected', () => {
        const gameAreaSpy = spyOn(gameAreaService, 'setAllData');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnCanvas(mouse, true);
        expect(classicService['isLeftCanvas']).toBeTruthy();
        expect(gameAreaSpy).toHaveBeenCalled();
        expect(classicServiceSpy).toBeTruthy();
    });

    it('should do nothing if the left click on modified image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnCanvas(mouse, false);
        expect(classicService['isLeftCanvas']).toBeFalsy();
    });

    it('should set isLeftCanvas to false if the left click on modified image is detected', () => {
        const gameAreaSpy = spyOn(gameAreaService, 'setAllData');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnCanvas(mouse, false);
        expect(classicService['isLeftCanvas']).toBeFalsy();
        expect(gameAreaSpy).toHaveBeenCalled();
        expect(classicServiceSpy).toBeTruthy();
    });

    it('showAbandonDialog should open abandon dialog', () => {
        component.showAbandonDialog();
        expect(dialog.open).toHaveBeenCalled();
    });

    it('showEndGameDialog should call dialog.open with the correct arguments', () => {
        const endingMessage = 'Bravo !';
        component.showEndGameDialog(endingMessage);
        expect(dialog.open).toHaveBeenCalled();
    });

    it('addRightSideMessage should add a message to the messages array and call ClassicService.sendMessage', () => {
        const sendMessageSpy = spyOn(component['classicService'], 'sendMessage');
        const text = 'Bravo !';
        const messagesLength = component.messages.length;
        component.addRightSideMessage(text);
        expect(messagesLength).toBeLessThan(component.messages.length);
        expect(sendMessageSpy).toHaveBeenCalledWith(text);
    });

    it('ngOnDestroy should unsubscribe from subscriptions', () => {
        component['gameSub'] = undefined as unknown as Subscription;
        component['timerSub'] = undefined as unknown as Subscription;
        component['differenceSub'] = undefined as unknown as Subscription;
        component['routeParamSub'] = undefined as unknown as Subscription;
        component['opponentDifferenceSub'] = undefined as unknown as Subscription;
        const resetCheatModeSpy = spyOn(gameAreaService, 'resetCheatMode');
        component.ngOnDestroy();
        expect(resetCheatModeSpy).toHaveBeenCalled();
    });
});
