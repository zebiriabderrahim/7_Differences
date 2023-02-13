import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';

import { ClassicSystemService } from './classic-system.service';

describe('ClassicSystemService', () => {
    let service: ClassicSystemService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [],
            providers: [ClientSocketService, GameAreaService],
        });
        service = TestBed.inject(ClassicSystemService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createSoloGame should create a game', () => {
        service['playerName'].subscribe((playerName = 'Jack') => {});
        service['id'].subscribe((id = 'Jack') => {});
        const socketSpy = spyOn(service['clientSocket'], 'send').and.callThrough();
        service.createSoloGame();
        expect(socketSpy).toHaveBeenCalledWith('createSoloGame', { player: 'Jack', gameId: '' });
    });
});
