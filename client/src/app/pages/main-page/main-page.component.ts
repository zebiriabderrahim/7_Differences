// import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
// import { CommunicationService } from '@app/services/communication.service';
// import { Message } from '@common/message';
// import { BehaviorSubject } from 'rxjs';
// import { map } from 'rxjs/operators';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly gameTitle: string = 'Rat-Coon';
    readonly gameRoute: string = '/game';
    readonly selectionRoute: string = '/selection';
    readonly configRoute: string = '/config';
    readonly teamNumber: string = '#101';
    readonly teammateNameList: string[] = ['Jeremy Ear', 'Sulayman Hosna', 'Edgar Kappauf', 'Mathieu Prévost', 'Zakaria Zair', 'Abderrahim Zebiri'];
}
