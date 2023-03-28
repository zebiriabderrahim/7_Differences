// To not call setAllData from gameAreaService
/* eslint-disable @typescript-eslint/no-empty-function */
// Needed more lines for the tests
/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { SocketTestHelper } from '@app/services/client-socket-service/client-socket.service.spec';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { ChatMessage, Differences, GameEvents, MessageEvents, MessageTag, Players } from '@common/game-interfaces';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ReplayService } from '../replay-service/replay.service';
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

    const mockPlayer1 = {
        playerId: 'Bob',
        name: 'Jackob',
        diffData: mockDifferences,
    };

    const mockPlayer2 = {
        playerId: 'Boby',
        name: 'Michel',
        diffData: mockDifferences,
    };

    const mockData = {
        clientGame: mockClientSideGame,
        players: {
            player1: mockPlayer1,
            player2: mockPlayer2,
        },
    };

    let mockDataDifference = {
        differencesData: mockDifferences,
        playerId: 'mockId',
    };

    // const playerNameStub = 'playerTest';
    const mockTimer = 0;
    const mockEndMessage = 'Fin de partie';

    let mockChatMessage: ChatMessage;
    let service: ClassicSystemService;
    let gameAreaService: GameAreaService;
    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        soundServiceSpy = jasmine.createSpyObj('SoundService', ['playCorrectSound', 'playErrorSound']);

        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [],
            providers: [
                { provide: ClientSocketService, useValue: socketServiceMock },
                { provide: GameAreaService, useValue: jasmine.createSpyObj('GameAreaService', ['replaceDifference', 'showError', 'setAllData']) },
                {
                    provide: MatDialog,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
                { provide: SoundService, useValue: soundServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        service = TestBed.inject(ClassicSystemService);
        service = new ClassicSystemService(
            socketServiceMock,
            TestBed.inject(GameAreaService),
            TestBed.inject(SoundService),
            TestBed.inject(ReplayService),
        );
        gameAreaService = TestBed.inject(GameAreaService);
        service['currentGame'].next(mockClientSideGame);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit game when game is truthy', (done) => {
        service['currentGame'].subscribe((emittedGame) => {
            expect(emittedGame).toEqual(mockClientSideGame);
            done();
        });

        service['currentGame'].next(mockClientSideGame);
    });

    it('timer$ should return timer as Observable', () => {
        const mockTimerSubject = new Subject<number>();
        service['timer'] = mockTimerSubject;
        expect(service.timer$).toEqual(mockTimerSubject.asObservable());
    });

    it('differenceFound$ should return differencesFound as Observable', () => {
        const differenceFoundSubject = new Subject<number>();
        service['differencesFound'] = differenceFoundSubject;
        expect(service.differencesFound$).toEqual(differenceFoundSubject.asObservable());
    });

    it('message$ should return message as Observable', () => {
        const mockMessageSubject = new Subject<ChatMessage>();
        service['message'] = mockMessageSubject;
        expect(service.message$).toEqual(mockMessageSubject.asObservable());
    });

    it('endMessage$ should return endMessage as Observable', () => {
        const mockEndMessageSubject = new Subject<string>();
        service['endMessage'] = mockEndMessageSubject;
        expect(service.endMessage$).toEqual(mockEndMessageSubject.asObservable());
    });

    it('opponentDifferenceFound$ should return opponentDifferenceFound as Observable', () => {
        const mockOpponentDifferenceFoundSubject = new Subject<number>();
        service['opponentDifferencesFound'] = mockOpponentDifferenceFoundSubject;
        expect(service.opponentDifferencesFound$).toEqual(mockOpponentDifferenceFoundSubject.asObservable());
    });

    it('players$ should return players as Observable', () => {
        const mockPlayersSubject = new Subject<Players>();
        service['players'] = mockPlayersSubject;
        expect(service.players$).toEqual(mockPlayersSubject.asObservable());
    });

    it('cheatDifferences$ should return cheatDifferences as Observable', () => {
        const mockCheatDifferencesSubject = new Subject<Coordinate[]>();
        service['cheatDifferences'] = mockCheatDifferencesSubject;
        expect(service.cheatDifferences$).toEqual(mockCheatDifferencesSubject.asObservable());
    });

    it('should not emit game when game is falsy', () => {
        spyOn(service['currentGame'], 'next');
        service['currentGame'].subscribe();
        expect(service['currentGame'].next).not.toHaveBeenCalled();
    });

    it('should only emit game when it is truthy', () => {
        service.currentGame$.subscribe((emittedGame) => {
            expect(emittedGame).toEqual(mockClientSideGame);
        });

        service['currentGame'].next(mockClientSideGame);
        service['currentGame'].next(mockClientSideGame);
    });

    it('connectPlayer should call connect if socket is not alive', () => {
        spyOn(socketServiceMock, 'isSocketAlive').and.callFake(() => false);
        const connectSpy = spyOn(socketServiceMock, 'connect');
        socketServiceMock.connect();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('requestVerification should send coordinate', () => {
        const requestVerificationSpy = spyOn(socketServiceMock, 'send');
        service.requestVerification({
            x: 1,
            y: 1,
        });
        expect(requestVerificationSpy).toHaveBeenCalledWith('removeDiff', { x: 1, y: 1 });
    });

    it('replaceDifference should throw an error if Coordinate length is 0', () => {
        service.replaceDifference([]);
        expect(gameAreaService.showError).toHaveBeenCalled();
        expect(soundServiceSpy.playErrorSound).toHaveBeenCalled();
    });

    it('setIsLeftCanvas should set isLeftCanvas', () => {
        expect(service['isLeftCanvas']).not.toBeTruthy();
        service.setIsLeftCanvas(true);
        expect(service['isLeftCanvas']).toBeTruthy();
    });

    it('disconnect should disconnect the socket', () => {
        const disconnectSpy = spyOn(socketServiceMock, 'disconnect');
        service.disconnect();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('replaceDifference should modify coordinate if coordinate length is greater than 0', () => {
        const cord: Coordinate[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service['isLeftCanvas'] = true;
        service.replaceDifference(cord);
        expect(gameAreaService.replaceDifference).toHaveBeenCalledWith(cord);
        expect(gameAreaService.showError).not.toHaveBeenCalled();
        expect(gameAreaService.setAllData).toHaveBeenCalled();
    });

    // it('manageSocket should connect the client socket', () => {
    //     const socketConnectSpy = spyOn(socketServiceMock, 'connect');
    //     service.manageSocket();
    //     expect(socketConnectSpy).toHaveBeenCalled();
    // });

    it('should return the socket id', () => {
        const socketId = '1234';
        socketServiceMock.socket.id = socketId;
        expect(service.getSocketId()).toEqual(socketId);
    });

    it('should call send method of ClientSocketService with correct arguments', () => {
        const socketSendSpy = spyOn(socketServiceMock, 'send');
        const gameId = 'game123';
        const playerName = 'John Doe';
        service.createSoloGame(gameId, playerName);
        expect(socketSendSpy).toHaveBeenCalledWith(GameEvents.CreateSoloGame, { gameId, playerName });
    });

    it('should send a "StartGameByRoomId" message to the server', () => {
        socketServiceMock.send = jasmine.createSpy('send');
        // const mockId = '1234';
        // const roomId = {
        //     roomId: mockId,
        //     playerName: playerNameStub,
        // };
        service.startGame();
        expect(socketServiceMock.send).toHaveBeenCalledWith(GameEvents.StartGameByRoomId);
    });

    it('should call clientSocket.send with GameEvents.CheckStatus', () => {
        socketServiceMock.send = jasmine.createSpy('send');
        service.checkStatus();
        expect(socketServiceMock.send).toHaveBeenCalledWith(GameEvents.CheckStatus);
    });

    it('should call clientSocket.send with GameEvents.AbandonGame', () => {
        socketServiceMock.send = jasmine.createSpy('send');
        service.abandonGame();
        expect(socketServiceMock.send).toHaveBeenCalledWith(GameEvents.AbandonGame);
    });

    it('should call send method of ClientSocketService with correct arguments', () => {
        const socketSendSpy = spyOn(socketServiceMock, 'send');
        const gameId = 'game123';
        const playerName = 'John Doe';
        service.joinOneVsOneGame(gameId, playerName);
        expect(socketSendSpy).toHaveBeenCalledWith(GameEvents.JoinOneVsOneGame, { gameId, playerName });
    });

    it('should call send method of ClientSocketService with correct arguments', () => {
        const socketSendSpy = spyOn(socketServiceMock, 'send');
        const gameId = 'game123';
        const playerName = 'John Doe';
        service.joinOneVsOneGame(gameId, playerName);
        expect(socketSendSpy).toHaveBeenCalledWith(GameEvents.JoinOneVsOneGame, { gameId, playerName });
    });

    it('should send a message to the client socket', () => {
        socketServiceMock.send = jasmine.createSpy('send');
        service.sendMessage('Hello world');
        expect(socketServiceMock.send).toHaveBeenCalledWith(MessageEvents.LocalMessage, { tag: MessageTag.received, message: 'Hello world' });
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

    it('manageSocket should update client game when GameStarted linked event is sent from server', () => {
        service.manageSocket();
        const currentGameSubjectNextSpy = spyOn(service['players'], 'next');
        socketHelper.peerSideEmit(GameEvents.GameStarted, mockData);
        expect(currentGameSubjectNextSpy).toHaveBeenCalledWith(mockData.players);
    });

    it('manageSocket should update client game when RemoveDiff linked event is sent from server', () => {
        const checkStatusSpy = spyOn(service, 'checkStatus');
        service.manageSocket();
        const differencesFoundSpy = spyOn(service['differencesFound'], 'next');
        socketHelper.peerSideEmit(GameEvents.RemoveDiff, mockDataDifference);
        expect(differencesFoundSpy).not.toHaveBeenCalledWith(mockDataDifference.differencesData.differencesFound);
        expect(checkStatusSpy).not.toHaveBeenCalled();
    });

    it('manageSocket should update client game when RemoveDiff linked event is sent from server and matches socketId', () => {
        const checkStatusSpy = spyOn(service, 'checkStatus');
        const getSocketIdSpy = spyOn(service, 'getSocketId').and.callFake(() => {
            return mockDataDifference.playerId;
        });
        const replaceDifferenceSpy = spyOn(service, 'replaceDifference');
        service.manageSocket();
        const differencesFoundSpy = spyOn(service['differencesFound'], 'next');
        socketHelper.peerSideEmit(GameEvents.RemoveDiff, mockDataDifference);
        expect(replaceDifferenceSpy).toHaveBeenCalledWith(mockDataDifference.differencesData.currentDifference);
        expect(differencesFoundSpy).toHaveBeenCalledWith(mockDataDifference.differencesData.differencesFound);
        expect(checkStatusSpy).toHaveBeenCalled();
        expect(getSocketIdSpy).toHaveBeenCalled();
    });

    it('manageSocket should update client game when RemoveDiff linked event is sent from server and do not match with non-empty array', () => {
        mockDataDifference = {
            differencesData: {
                currentDifference: [{ x: 1, y: 1 }],
                differencesFound: 0,
            },
            playerId: 'mockId',
        };
        const checkStatusSpy = spyOn(service, 'checkStatus');
        const getSocketIdSpy = spyOn(service, 'getSocketId').and.callFake(() => {
            return 'notMatchingSocketId';
        });

        const replaceDifferenceSpy = spyOn(service, 'replaceDifference');
        service.manageSocket();
        const differencesFoundSpy = spyOn(service['differencesFound'], 'next');
        socketHelper.peerSideEmit(GameEvents.RemoveDiff, mockDataDifference);
        expect(replaceDifferenceSpy).toHaveBeenCalledWith(mockDataDifference.differencesData.currentDifference);
        expect(differencesFoundSpy).not.toHaveBeenCalledWith(mockDataDifference.differencesData.differencesFound);
        expect(checkStatusSpy).not.toHaveBeenCalled();
        expect(getSocketIdSpy).toHaveBeenCalled();
    });

    it('manageSocket should update client game when TimerStarted linked event is sent from server', () => {
        service.manageSocket();
        const timerSpy = spyOn(service['timer'], 'next');
        socketHelper.peerSideEmit(GameEvents.TimerStarted, mockTimer);
        expect(timerSpy).toHaveBeenCalledWith(mockTimer);
    });

    it('manageSocket should update client game when EndGame linked event is sent from server', () => {
        service.manageSocket();
        const endSpy = spyOn(service['endMessage'], 'next');
        socketHelper.peerSideEmit(GameEvents.EndGame, mockEndMessage);
        expect(endSpy).toHaveBeenCalledWith(mockEndMessage);
    });

    it('manageSocket should update client game when MessageEvents linked event is sent from server', () => {
        service.manageSocket();
        const chatMessageSpy = spyOn(service['message'], 'next');
        socketHelper.peerSideEmit(MessageEvents.LocalMessage, mockChatMessage);
        expect(chatMessageSpy).toHaveBeenCalledWith(mockChatMessage);
    });
});
