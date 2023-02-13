import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { SocketTestHelper } from '@app/services/client-socket-service/client-socket.service.spec';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ClientSideGame } from '@common/game-interfaces';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ClassicSystemService } from './classic-system.service';

class SocketClientServiceMock extends ClientSocketService {
    override connect() {
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
        service.manageSocket();
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
});
