import { Component, OnInit, Input } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Component({
  selector: 'app-game-infos',
  templateUrl: './game-infos.component.html',
  styleUrls: ['./game-infos.component.scss']
})
export class GameInfosComponent implements OnInit {

  @Input() game: Game

  ngOnInit(): void {
  }

}
