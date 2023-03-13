import { TestBed } from '@angular/core/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';

describe('RoomManagerService', () => {
    let service: RoomManagerService;
    let clientSocketSpy: jasmine.SpyObj<ClientSocketService>;

    beforeEach(() => {
        clientSocketSpy = jasmine.createSpyObj('ClientSocketService', ['disconnect', 'send', 'on']);
        TestBed.configureTestingModule({
            providers: [{ provide: ClientSocketService, useValue: clientSocketSpy }],
        });
        service = TestBed.inject(RoomManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
