// To not call setAllData from gameAreaService
/* eslint-disable @typescript-eslint/no-empty-function */
// Needed more lines for the tests
/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { SocketTestHelper } from '@app/services/client-socket-service/client-socket.service.spec';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { GameEvents, MessageEvents, MessageTag } from '@common/enums';
import { ChatMessage, Differences, GameRoom, Players } from '@common/game-interfaces';
import { Subject, filter } from 'rxjs';
import { CaptureService } from '@app/services/capture-service/capture.service';
import { Socket } from 'socket.io-client';
import { GameManagerService } from './game-manager.service';

class SocketClientServiceMock extends ClientSocketService {
    override connect() {
        return;
    }
    override disconnect() {
        return;
    }
}
describe('GameManagerService', () => {
    const mockClientSideGame = {
        id: 'JackGame',
        name: 'le Jeu de Jack',
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
        differenceData: mockDifferences,
    };

    const mockPlayer2 = {
        playerId: 'Boby',
        name: 'Michel',
        differenceData: mockDifferences,
    };

    const mockRoom: GameRoom = {
        roomId: 'mockRoom',
        clientGame: mockClientSideGame,
        endMessage: '',
        timer: 0,
        originalDifferences: [[]],
        gameConstants: {
            countdownTime: 0,
            penaltyTime: 0,
            bonusTime: 0,
        },
        player2: mockPlayer2,
        player1: mockPlayer1,
    };

    let mockDataDifference = {
        differencesData: mockDifferences,
        playerId: 'mockId',
    };

    const mockTimer = 0;
    const mockNDifferences = 0;
    const mockEndMessage = 'Fin de partie';

    let mockChatMessage: ChatMessage;
    let service: GameManagerService;
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
        service = TestBed.inject(GameManagerService);
        service = new GameManagerService(
            socketServiceMock,
            TestBed.inject(GameAreaService),
            TestBed.inject(SoundService),
            TestBed.inject(CaptureService),
        );
        gameAreaService = TestBed.inject(GameAreaService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('message$ should return message as Observable', () => {
        const mockMessageSubject = new Subject<ChatMessage>();
        service['message'] = mockMessageSubject;
        const expectedMessage = service['message']
            .asObservable()
            .pipe(filter((message) => !!message))
            .toString();
        expect(service.message$.toString()).toEqual(expectedMessage);
    });

    it('endMessage$ should return endMessage as Observable', () => {
        const mockEndMessageSubject = new Subject<string>();
        service['endMessage'] = mockEndMessageSubject;
        const expectedEndMessage = service['endMessage']
            .asObservable()
            .pipe(filter((endMessage) => !!endMessage))
            .toString();
        expect(service.endMessage$.toString()).toEqual(expectedEndMessage);
    });

    it('players$ should return players as Observable', () => {
        const mockPlayersSubject = new Subject<Players>();
        service['players'] = mockPlayersSubject;
        const expectedPlayers = service['players']
            .asObservable()
            .pipe(filter((players) => !!players))
            .toString();
        expect(service.players$.toString()).toEqual(expectedPlayers);
    });

    it('isFirstDifferencesFound$ should return isFirstDifferencesFound as Observable', () => {
        const mockIsFirstDifferencesFoundSubject = new Subject<boolean>();
        service['isFirstDifferencesFound'] = mockIsFirstDifferencesFoundSubject;
        expect(service.isFirstDifferencesFound$).toEqual(mockIsFirstDifferencesFoundSubject.asObservable());
    });

    it('isGameModeChanged$ should return isGameModeChanged as Observable', () => {
        const mockIsGameModeChangedSubject = new Subject<boolean>();
        service['isGameModeChanged'] = mockIsGameModeChangedSubject;
        expect(service.isGameModeChanged$).toEqual(mockIsGameModeChangedSubject.asObservable());
    });

    it('isGamePageRefreshed$ should return isGamePageRefreshed as Observable', () => {
        const mockIsGamePageRefreshedSubject = new Subject<boolean>();
        service['isGamePageRefreshed'] = mockIsGamePageRefreshedSubject;
        expect(service.isGamePageRefreshed$).toEqual(mockIsGamePageRefreshedSubject.asObservable());
    });

    it('setMessage should call next on message', () => {
        const messageNextSpy = spyOn(service['message'], 'next');
        service.setMessage(mockChatMessage);
        expect(messageNextSpy).toHaveBeenCalledOnceWith(mockChatMessage);
    });

    it('startNextGame should call clientSocket.send with GameEvents.StartNextGame', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.startNextGame();
        expect(sendSpy).toHaveBeenCalledOnceWith(GameEvents.StartNextGame);
    });

    it('requestHint should call clientSocket.send with GameEvents.RequestHint', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.requestHint();
        expect(sendSpy).toHaveBeenCalledOnceWith(GameEvents.RequestHint);
    });

    it('removeAllListeners should call clientSocket.socket.off', () => {
        const offSpy = spyOn(socketServiceMock.socket, 'off');
        service.removeAllListeners();
        expect(offSpy).toHaveBeenCalled();
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

    it('should not emit timer when timer is falsy', () => {
        spyOn(service['timer'], 'next');
        service['timer'].subscribe();
        expect(service['timer'].next).not.toHaveBeenCalled();
    });

    it('should only emit timer when it is truthy', () => {
        service.timer$.subscribe((emittedTimer) => {
            expect(emittedTimer).toEqual(mockTimer);
        });

        service['timer'].next(mockTimer);
        service['timer'].next(mockTimer);

        const expectedTimer = service['timer']
            .asObservable()
            .pipe(filter((timer) => !!timer))
            .toString();
        expect(service.timer$.toString()).toEqual(expectedTimer);
    });

    it('should not emit differencesFound when differencesFound is falsy', () => {
        spyOn(service['differencesFound'], 'next');
        service['differencesFound'].subscribe();
        expect(service['differencesFound'].next).not.toHaveBeenCalled();
    });

    it('should only emit differencesFound when it is truthy', () => {
        service.differencesFound$.subscribe((emittedDifferences) => {
            expect(emittedDifferences).toEqual(mockNDifferences);
        });

        service['differencesFound'].next(mockNDifferences);
        service['differencesFound'].next(mockNDifferences);
        const expectedDifferencesFound = service['differencesFound']
            .asObservable()
            .pipe(filter((differencesFound) => !!differencesFound))
            .toString();
        expect(service.differencesFound$.toString()).toEqual(expectedDifferencesFound);
    });

    it('should not emit message when message is falsy', () => {
        spyOn(service['message'], 'next');
        service['message'].subscribe();
        expect(service['message'].next).not.toHaveBeenCalled();
    });

    it('should only emit message when it is truthy', () => {
        const mockMessage: ChatMessage = {
            message: 'test',
            tag: MessageTag.Sent,
        };

        service.message$.subscribe((emittedMessage) => {
            expect(emittedMessage).toEqual(mockMessage);
        });

        service['message'].next(mockMessage);
        service['message'].next(mockMessage);
    });

    it('should not emit endMessage when endMessage is falsy', () => {
        spyOn(service['endMessage'], 'next');
        service['endMessage'].subscribe();
        expect(service['endMessage'].next).not.toHaveBeenCalled();
    });

    it('should only emit endMessage when it is truthy', () => {
        service.endMessage$.subscribe((emittedMessage) => {
            expect(emittedMessage).toEqual(mockEndMessage);
        });

        service['endMessage'].next(mockEndMessage);
        service['endMessage'].next(mockEndMessage);
    });

    it('should not emit opponentDifferencesFound when opponentDifferencesFound is falsy', () => {
        spyOn(service['opponentDifferencesFound'], 'next');
        service['opponentDifferencesFound'].subscribe();
        expect(service['opponentDifferencesFound'].next).not.toHaveBeenCalled();
    });

    it('should only emit opponentDifferencesFound when it is truthy', () => {
        const mockOpponentDifferenceFound = 0;
        service.opponentDifferencesFound$.subscribe((emittedMockOpponentDifferenceFound) => {
            expect(emittedMockOpponentDifferenceFound).toEqual(mockOpponentDifferenceFound);
        });

        service['opponentDifferencesFound'].next(mockOpponentDifferenceFound);
        service['opponentDifferencesFound'].next(mockOpponentDifferenceFound);

        const expectedOpponentDifferenceFound = service['opponentDifferencesFound']
            .asObservable()
            .pipe(filter((opponentDifferencesFound) => !!opponentDifferencesFound))
            .toString();
        expect(service.opponentDifferencesFound$.toString()).toEqual(expectedOpponentDifferenceFound);
    });

    it('should not emit players when players is falsy', () => {
        spyOn(service['players'], 'next');
        service['players'].subscribe();
        expect(service['players'].next).not.toHaveBeenCalled();
    });

    it('should only emit players when it is truthy', () => {
        const mockPlayers: Players = {
            player1: mockPlayer1,
            player2: mockPlayer2,
        };
        service.players$.subscribe((emittedPlayers) => {
            expect(emittedPlayers).toEqual(mockPlayers);
        });

        service['players'].next(mockPlayers);
        service['players'].next(mockPlayers);
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
        expect(requestVerificationSpy).toHaveBeenCalledWith('removeDifference', { x: 1, y: 1 });
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

    it('should return the socket id', () => {
        const socketId = '1234';
        socketServiceMock.socket.id = socketId;
        expect(service.getSocketId()).toEqual(socketId);
    });

    it('should send a "StartGameByRoomId" message to the server', () => {
        socketServiceMock.send = jasmine.createSpy('send');
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

    it('should send a message to the client socket', () => {
        socketServiceMock.send = jasmine.createSpy('send');
        service.sendMessage('Hello world');
        expect(socketServiceMock.send).toHaveBeenCalledWith(MessageEvents.LocalMessage, { tag: MessageTag.Received, message: 'Hello world' });
    });

    it('manageSocket should update client game when GameStarted linked event is sent from server', () => {
        service.manageSocket();
        const currentGameSubjectNextSpy = spyOn(service['currentGame'], 'next');
        socketHelper.peerSideEmit(GameEvents.GameStarted, mockRoom);
        expect(currentGameSubjectNextSpy).toHaveBeenCalledWith(mockRoom.clientGame);
    });

    it('manageSocket should update client game when RemoveDifference linked event is sent from server', () => {
        const checkStatusSpy = spyOn(service, 'checkStatus');
        service.manageSocket();
        const differencesFoundSpy = spyOn(service['differencesFound'], 'next');
        socketHelper.peerSideEmit(GameEvents.RemoveDifference, mockDataDifference);
        expect(differencesFoundSpy).not.toHaveBeenCalledWith(mockDataDifference.differencesData.differencesFound);
        expect(checkStatusSpy).not.toHaveBeenCalled();
    });

    it('manageSocket should update client game when RemoveDifference linked event is sent from server and matches socketId', () => {
        const checkStatusSpy = spyOn(service, 'checkStatus');
        const getSocketIdSpy = spyOn(service, 'getSocketId').and.callFake(() => {
            return mockDataDifference.playerId;
        });
        const replaceDifferenceSpy = spyOn(service, 'replaceDifference');
        service.manageSocket();
        const differencesFoundSpy = spyOn(service['differencesFound'], 'next');
        socketHelper.peerSideEmit(GameEvents.RemoveDifference, mockDataDifference);
        expect(replaceDifferenceSpy).toHaveBeenCalledWith(mockDataDifference.differencesData.currentDifference);
        expect(differencesFoundSpy).toHaveBeenCalledWith(mockDataDifference.differencesData.differencesFound);
        expect(checkStatusSpy).toHaveBeenCalled();
        expect(getSocketIdSpy).toHaveBeenCalled();
    });

    it('manageSocket should update client game when RemoveDifference linked event is sent from server and do not match with non-empty array', () => {
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
        socketHelper.peerSideEmit(GameEvents.RemoveDifference, mockDataDifference);
        expect(replaceDifferenceSpy).toHaveBeenCalledWith(mockDataDifference.differencesData.currentDifference);
        expect(differencesFoundSpy).not.toHaveBeenCalledWith(mockDataDifference.differencesData.differencesFound);
        expect(checkStatusSpy).not.toHaveBeenCalled();
        expect(getSocketIdSpy).toHaveBeenCalled();
    });

    it('manageSocket should update client game when TimerStarted linked event is sent from server', () => {
        service.manageSocket();
        const timerSpy = spyOn(service['timer'], 'next');
        socketHelper.peerSideEmit(GameEvents.TimerUpdate, mockTimer);
        expect(timerSpy).toHaveBeenCalledWith(mockTimer);
    });

    it('manageSocket should update client game when EndGame linked event is sent from server', () => {
        service.manageSocket();
        const endSpy = spyOn(service['endMessage'], 'next');
        socketHelper.peerSideEmit(GameEvents.EndGame, mockEndMessage);
        expect(endSpy).toHaveBeenCalledWith(mockEndMessage);
    });

    it('manageSocket should update client game when UpdateDifferencesFound linked event is sent from server', () => {
        service.manageSocket();
        const differencesFoundSpy = spyOn(service['differencesFound'], 'next');
        socketHelper.peerSideEmit(GameEvents.UpdateDifferencesFound, mockTimer);
        expect(differencesFoundSpy).toHaveBeenCalledWith(mockTimer);
    });

    it('manageSocket should update client game when GameModeChanged linked event is sent from server', () => {
        service.manageSocket();
        const isGameModeChangedSpy = spyOn(service['isGameModeChanged'], 'next');
        socketHelper.peerSideEmit(GameEvents.GameModeChanged);
        expect(isGameModeChangedSpy).toHaveBeenCalledWith(true);
    });

    it('manageSocket should update client game when GamePageRefreshed linked event is sent from server', () => {
        service.manageSocket();
        const isGamePageRefreshedSpy = spyOn(service['isGamePageRefreshed'], 'next');
        socketHelper.peerSideEmit(GameEvents.GamePageRefreshed);
        expect(isGamePageRefreshedSpy).toHaveBeenCalledWith(true);
    });

    it('manageSocket should update client game when MessageEvents linked event is sent from server', () => {
        service.manageSocket();
        const chatMessageSpy = spyOn(service['message'], 'next');
        socketHelper.peerSideEmit(MessageEvents.LocalMessage, mockChatMessage);
        expect(chatMessageSpy).toHaveBeenCalledWith(mockChatMessage);
    });
});
