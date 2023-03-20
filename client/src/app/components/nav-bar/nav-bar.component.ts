import { Component } from '@angular/core';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
    readonly gameRoute: string;
    readonly selectionRoute: string;
    readonly configRoute: string;
    readonly homeRoute: string;

    constructor() {
        this.gameRoute = '/game';
        this.selectionRoute = '/selection';
        this.configRoute = '/config';
        this.homeRoute = '/home';
    }
}
