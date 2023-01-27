import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';

@Injectable({
    providedIn: 'root',
})
export class GameAreaService {
    game: Game;
    originalCanvas: CanvasRenderingContext2D;
    modifiedCanvas: CanvasRenderingContext2D;
    originalCanvasLayer: CanvasRenderingContext2D;
    modifiedCanvasLayer: CanvasRenderingContext2D;
}
