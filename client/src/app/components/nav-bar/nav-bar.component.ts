import { Component } from '@angular/core';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
    readonly gameRoute: string = '/game';
    readonly selectionRoute: string = '/selection';
    readonly configRoute: string = '/config';
    readonly homeRoute: string = '/home';
}
