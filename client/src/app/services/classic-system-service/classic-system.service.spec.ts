import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { SocketTestHelper } from '@app/services/client-socket-service/client-socket.service.spec';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ClientSideGame, Differences, GameEvents } from '@common/game-interfaces';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ClassicSystemService } from './classic-system.service';

class SocketClientServiceMock extends ClientSocketService {
    override connect() {
        return;
    }
    override disconnect() {
        return;
    }
}
describe('ClassicSystemService', () => {
    const mockClientSideGame = {
        id: 'JackGame',
        name: 'le Jeu de Jack',
        player: 'Jackob',
        mode: 'SoloGame',
        original: 'path/to/original',
        modified: 'path/to/modified',
        isHard: true,
        differencesCount: 0,
    };

    const mockDifferences: Differences = {
        currentDifference: [],
        differencesFound: 0,
    };

    const mockTimer = 0;

    let service: ClassicSystemService;
    let gameAreaService: GameAreaService;
    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let classicServiceGetCurrentGameSpy: () => Subject<ClientSideGame>;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [],
            providers: [
                { provide: ClientSocketService, useValue: socketServiceMock },
                { provide: GameAreaService, useValue: gameAreaService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        service = TestBed.inject(ClassicSystemService);
        gameAreaService = TestBed.inject(GameAreaService);
        service['currentGame'].next(mockClientSideGame);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('connectPlayer should call connect if socket is not alive', () => {
        spyOn(socketServiceMock, 'isSocketAlive').and.callFake(() => false);
        const connectSpy = spyOn(socketServiceMock, 'connect');
        socketServiceMock.connect();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('createSoloGame should call createSoloGame with appropriate information', () => {
        service.createSoloGame();
        const createSoloGameSpy = spyOn(socketServiceMock, 'send');
        service['playerName'].next('Jackob');
        service['id'].next('JackGame');
        expect(createSoloGameSpy).toHaveBeenCalledWith('createSoloGame', { player: 'Jackob', gameId: 'JackGame' });
    });

    it('checkStatus should call checkStatus', () => {
        const checkStatusSpy = spyOn(socketServiceMock, 'send');
        service.checkStatus();
        expect(checkStatusSpy).toHaveBeenCalledWith('checkStatus', socketServiceMock.socket.id);
    });

    it('requestVerification should send coordinate', () => {
        const requestVerificationSpy = spyOn(socketServiceMock, 'send');
        service.requestVerification({
            x: 1,
            y: 1,
        });
        expect(requestVerificationSpy).toHaveBeenCalledWith('removeDiff', { x: 1, y: 1 });
    });

    /*
    it('replaceDifference should throw an error if Coordinate length is 0', () => {
        const replaceDifferenceSpy = spyOn(gameAreaService, 'showError');
        service.replaceDifference([]);
        expect(replaceDifferenceSpy).toHaveBeenCalled();
    });

    it('replaceDifference should modify coordinate if coordinate length is greater than 0', () => {
        const cord: Coordinate[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        const replaceDifferenceSpy = spyOn(service['gameAreaService'], 'replaceDifference');
        service.replaceDifference(cord);
        expect(replaceDifferenceSpy).toHaveBeenCalledWith(cord);
    });
    */
    it('getCurrentGame should call return currentgame', () => {
        classicServiceGetCurrentGameSpy = spyOn(service, 'getCurrentGame').and.callFake(() => {
            return service['currentGame'];
        });
        service.getCurrentGame();
        expect(classicServiceGetCurrentGameSpy).toEqual(service['currentGame']);
    });

    it('manageSocket should connect the client socket', () => {
        const socketConnectSpy = spyOn(socketServiceMock, 'connect');
        service.manageSocket();
        expect(socketConnectSpy).toHaveBeenCalled();
    });

    it('manageSocket should call createSoloGame function', () => {
        const createSoloGameSpy = spyOn(service, 'createSoloGame');
        service.manageSocket();
        expect(createSoloGameSpy).toHaveBeenCalled();
    });

    it('manageSocket should add the events listeners to CreateSoloGame, RemoveDiff and TimerStarted events', () => {
        const socketOnSpy = spyOn(socketServiceMock, 'on');
        service.manageSocket();
        expect(socketOnSpy).toHaveBeenCalledWith(GameEvents.CreateSoloGame, jasmine.any(Function));
        expect(socketOnSpy).toHaveBeenCalledWith(GameEvents.RemoveDiff, jasmine.any(Function));
        expect(socketOnSpy).toHaveBeenCalledWith(GameEvents.TimerStarted, jasmine.any(Function));
        expect(socketOnSpy).toHaveBeenCalledWith(GameEvents.EndGame, jasmine.any(Function));
    });

    it('manageSocket should update client game when CreateSoloGame linked event is sent from server', () => {
        service.manageSocket();
        const currentGameSubjectNextSpy = spyOn(service['currentGame'], 'next');
        socketHelper.peerSideEmit(GameEvents.CreateSoloGame, mockClientSideGame);
        expect(currentGameSubjectNextSpy).toHaveBeenCalledWith(mockClientSideGame);
    });

    it('manageSocket should update client game when RemoveDiff linked event is sent from server', () => {
        service.manageSocket();
        const replaceDifferenceSpy = spyOn(service, 'replaceDifference');
        const differencesFoundSpy = spyOn(service['differencesFound'], 'next');
        const checkStatusSpy = spyOn(service, 'checkStatus');
        socketHelper.peerSideEmit(GameEvents.RemoveDiff, mockDifferences);
        expect(replaceDifferenceSpy).toHaveBeenCalledWith(mockDifferences.currentDifference);
        expect(differencesFoundSpy).toHaveBeenCalledWith(mockDifferences.differencesFound);
        expect(checkStatusSpy).toHaveBeenCalled();
    });

    it('manageSocket should update client game when TimerStarted linked event is sent from server', () => {
        service.manageSocket();
        const timerSpy = spyOn(service['timer'], 'next');
        socketHelper.peerSideEmit(GameEvents.TimerStarted, mockTimer);
        expect(timerSpy).toHaveBeenCalledWith(mockTimer);
    });

    it('manageSocket should disconnect clientSocket when EndGame linked event is sent from server', () => {
        service.manageSocket();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const showEndSpy = spyOn(service, 'showEndGameDialog').and.callFake(() => {});
        const socketDisconnectSpy = spyOn(socketServiceMock, 'disconnect');
        socketHelper.peerSideEmit(GameEvents.EndGame, '');
        expect(socketDisconnectSpy).toHaveBeenCalled();
        expect(showEndSpy).toHaveBeenCalled();
    });
});
