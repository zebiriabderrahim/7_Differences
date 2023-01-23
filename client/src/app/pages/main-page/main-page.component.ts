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

    // message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    // constructor(private readonly communicationService: CommunicationService) {}

    // sendTimeToServer(): void {
    //     const newTimeMessage: Message = {
    //         title: 'Hello from the client',
    //         body: 'Time is : ' + new Date().toString(),
    //     };
    //     // Important de ne pas oublier "subscribe" ou l'appel ne sera jamais lancé puisque personne l'observe
    //     this.communicationService.basicPost(newTimeMessage).subscribe({
    //         next: (response) => {
    //             const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
    //             this.message.next(responseString);
    //         },
    //         error: (err: HttpErrorResponse) => {
    //             const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
    //             this.message.next(responseString);
    //         },
    //     });
    // }

    // getMessagesFromServer(): void {
    //     this.communicationService
    //         .basicGet()
    //         // Cette étape transforme l'objet Message en un seul string
    //         .pipe(
    //             map((message: Message) => {
    //                 return `${message.title} ${message.body}`;
    //             }),
    //         )
    //         .subscribe(this.message);
    // }
}
