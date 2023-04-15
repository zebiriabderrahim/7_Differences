import { Component } from '@angular/core';
import { SoundService } from '@app/services/sound-service/sound.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly gameTitle: string;
    readonly selectionRoute: string;
    readonly limitedRoute: string;
    readonly configRoute: string;
    readonly teamNumber: string;
    readonly teammateNameList: string[];
    constructor(private readonly soundService: SoundService) {
        this.gameTitle = '7 Différences';
        this.selectionRoute = '/selection';
        this.configRoute = '/config';
        this.limitedRoute = '/limited';
        this.teamNumber = "Présenté par l'équipe 101";
        this.teammateNameList = ['Jeremy Ear,', 'Sulayman Hosna,', 'Edgar Kappauf,', 'Mathieu Prévost,', 'Zakaria Zair,', 'Abderrahim Zebiri'];
        this.soundService.loopBackgroundMusic();
    }
}
