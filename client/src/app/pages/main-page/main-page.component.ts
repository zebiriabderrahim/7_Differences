import { Component } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly gameTitle: string;
    readonly gameRoute: string;
    readonly selectionRoute: string;
    readonly configRoute: string;
    readonly teamNumber: string;
    readonly teammateNameList: string[];
    constructor() {
        this.gameTitle = 'Rat-Coon Game';
        this.gameRoute = '/game';
        this.selectionRoute = '/selection';
        this.configRoute = '/config';
        this.teamNumber = "Présenté par l'équipe 101";
        this.teammateNameList = ['Jeremy Ear,', 'Sulayman Hosna,', 'Edgar Kappauf,', 'Mathieu Prévost,', 'Zakaria Zair,', 'Abderrahim Zebiri'];
    }
}
