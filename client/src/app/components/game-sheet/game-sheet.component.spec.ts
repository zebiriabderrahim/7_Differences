// // Needed for functions mock
// /* eslint-disable @typescript-eslint/no-empty-function */
// // Id comes from database to allow _id
// /* eslint-disable no-underscore-dangle */
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// // import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { GameSheetComponent } from '@app/components/game-sheet/game-sheet.component';
// // import { routes } from '@app/modules/app-routing.module';
// // import { CommunicationService } from '@app/services/communication-service/communication.service';
// // import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';

// describe('GameSheetComponent', () => {
//     let component: GameSheetComponent;
//     let fixture: ComponentFixture<GameSheetComponent>;
//     // let communicationService: CommunicationService;
//     // let roomManagerService: RoomManagerService;
//     // const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
//     // const roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', [
//     //     'handleRoomEvents',
//     //     'checkRoomOneVsOneAvailability',
//     //     'disconnect',
//     //     'pipe',
//     // ]);

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             imports: [RouterTestingModule, MatDialogModule, BrowserAnimationsModule, HttpClientTestingModule],
//             declarations: [GameSheetComponent],
//             providers: [
//                 // CommunicationService,
//                 // {
//                 //     // provide: ClassicSystemService,
//                 //     // // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for fake
//                 //     // useValue: {
//                 //     //     playerName: { next: () => {} },
//                 //     //     id: { next: () => {} },
//                 //     //     manageSocket: () => {},
//                 //     //     checkIfOneVsOneIsAvailable: () => {},
//                 //     //     disconnect: () => {},
//                 //     // },
//                 //     // TODO : Fix this freaking mess
//                 // },
//                 // {
//                 //     provide: MatDialogRef,
//                 //     useValue: {},
//                 // },
//                 {
//                     provide: MatDialog,
//                 },
//                 // {
//                 //     provide: MAT_DIALOG_DATA,
//                 //     useValue: {},
//                 // },
//                 // {
//                 //     provide: Router,
//                 //     useValue: routerSpy,
//                 // },
//                 // {
//                 //     provide: RoomManagerService,
//                 //     useValue: roomManagerServiceSpy,
//                 // },
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(GameSheetComponent);
//         // communicationService = TestBed.inject(CommunicationService);
//         // roomManagerService = TestBed.inject(RoomManagerService);
//         // component = fixture.componentInstance;

//         // component.game = {
//         //     _id: '0',
//         //     name: 'test',
//         //     difficultyLevel: true,
//         //     soloTopTime: [],
//         //     oneVsOneTopTime: [],
//         //     thumbnail: '',
//         // };
//         fixture.detectChanges();

//         // spyOn(roomManagerService, 'handleRoomEvents').and.callFake(() => {});
//         // roomManagerServiceSpy.handleRoomEvents.and.callFake(() => {});
//         // roomManagerServiceSpy.oneVsOneRoomsAvailabilityByRoomId$ = of({ gameId: '0', isAvailableToJoin: true });
//     });

//     // afterEach(() => {
//     //     fixture.destroy();
//     // });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
