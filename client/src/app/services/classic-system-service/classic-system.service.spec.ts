import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { SocketTestHelper } from '@app/services/client-socket-service/client-socket.service.spec';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
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

    it('createSoloGame should call createSoloGame', () => {
        service.createSoloGame();
        const createSoloGameSpy = spyOn(socketServiceMock, 'send');
        service['playerName'].next('Jackob');
        service['id'].next('JackGame');
        expect(createSoloGameSpy).toHaveBeenCalledWith('createSoloGame', { player: 'Jackob', gameId: 'JackGame' });
    });
});
