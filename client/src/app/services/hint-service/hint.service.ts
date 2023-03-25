import { Injectable } from '@angular/core';
import { DEFAULT_N_HINTS, HINT_SQUARE_PADDING, INITIAL_QUADRANT } from '@app/constants/hint';
import { QuadrantPosition } from '@app/enum/quadrant-position';
import { Quadrant } from '@app/interfaces/quadrant';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { Coordinate } from '@common/coordinate';
@Injectable({
    providedIn: 'root',
})
export class HintService {
    nAvailableHints: number;
    constructor(private readonly classicSystem: ClassicSystemService, private readonly gameAreaService: GameAreaService) {
        this.nAvailableHints = DEFAULT_N_HINTS;
    }

    requestHint() {
        if (this.nAvailableHints > 0) {
            console.log('requesting hint');
            console.log(this.classicSystem.cheatDifferences);
            let hintQuadrant = this.getHintQuadrant(this.classicSystem.cheatDifferences, INITIAL_QUADRANT);
            if (this.nAvailableHints === DEFAULT_N_HINTS - 1) {
                hintQuadrant = this.getHintQuadrant(this.classicSystem.cheatDifferences, hintQuadrant);
            }
            this.gameAreaService.flashCorrectPixels(this.generateHintSquare(hintQuadrant));
            this.nAvailableHints--;
        }
    }

    private getHintQuadrant(differencesCoordinates: Coordinate[], quadrant: Quadrant): Quadrant {
        const subQuadrants: Quadrant[] = this.getSubQuadrants(quadrant);
        // TODO: fix duplicate halfzies
        const halfWidth = (quadrant.topCorner.x - quadrant.bottomCorner.x) / 2;
        const halfHeight = (quadrant.topCorner.y - quadrant.bottomCorner.y) / 2;
        const quadrants: QuadrantPosition[] = [];
        for (let coord of differencesCoordinates) {
            coord = { x: coord.x, y: quadrant.topCorner.y - coord.y };
            if (coord.x > halfWidth) {
                if (!quadrants.includes(QuadrantPosition.First) && coord.y > halfHeight) {
                    console.log('first');
                    console.log(coord);
                    quadrants.push(QuadrantPosition.First);
                } else if (!quadrants.includes(QuadrantPosition.Fourth) && coord.y > quadrant.bottomCorner.y) {
                    console.log('forth');
                    console.log(coord);
                    quadrants.push(QuadrantPosition.Fourth);
                }
            } else if (coord.x > quadrant.bottomCorner.x) {
                if (!quadrants.includes(QuadrantPosition.Second) && coord.y > halfHeight) {
                    console.log('second');
                    console.log(coord);
                    quadrants.push(QuadrantPosition.Second);
                } else if (!quadrants.includes(QuadrantPosition.Third) && coord.y > quadrant.bottomCorner.y) {
                    console.log('third');
                    console.log(coord);
                    quadrants.push(QuadrantPosition.Third);
                }
            }
        }
        console.log('quadrants: ' + quadrants);
        const quadrantNumber: number = quadrants.length > 1 ? this.generateRandomNumber(0, quadrants.length - 1) : 0;
        console.log('quadrantNumber: ' + quadrantNumber);
        console.log('subQuadrants: ');
        console.log(subQuadrants[quadrants[quadrantNumber]]);
        return subQuadrants[quadrantNumber];
    }

    private generateRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private generateHintSquare(quadrant: Quadrant): Coordinate[] {
        const hintSquare: Coordinate[] = [];

        for (let j = quadrant.bottomCorner.y; j < quadrant.topCorner.y; j++) {
            for (let i = quadrant.bottomCorner.x; i < quadrant.bottomCorner.x + HINT_SQUARE_PADDING; i++) {
                hintSquare.push({ x: i, y: j });
            }
            for (let i = quadrant.topCorner.x - HINT_SQUARE_PADDING; i < quadrant.topCorner.x; i++) {
                hintSquare.push({ x: i, y: j });
            }
        }

        for (let i = quadrant.bottomCorner.x; i < quadrant.topCorner.x; i++) {
            for (let j = quadrant.topCorner.y - HINT_SQUARE_PADDING; j < quadrant.topCorner.y; j++) {
                hintSquare.push({ x: i, y: j });
            }
            for (let j = quadrant.bottomCorner.y; j < quadrant.bottomCorner.y + HINT_SQUARE_PADDING; j++) {
                hintSquare.push({ x: i, y: j });
            }
        }
        return hintSquare;
    }

    private getSubQuadrants(quadrant: Quadrant): Quadrant[] {
        const halfWidth = (quadrant.topCorner.x - quadrant.bottomCorner.x) / 2;
        const halfHeight = (quadrant.topCorner.y - quadrant.bottomCorner.y) / 2;
        const subQuadrants: Quadrant[] = [
            {
                bottomCorner: { x: quadrant.bottomCorner.x + halfWidth, y: quadrant.bottomCorner.y },
                topCorner: { x: quadrant.topCorner.x, y: quadrant.bottomCorner.y + halfHeight },
            },
            {
                bottomCorner: { x: quadrant.bottomCorner.x, y: quadrant.bottomCorner.y },
                topCorner: { x: quadrant.bottomCorner.x + halfWidth, y: quadrant.bottomCorner.y + halfHeight },
            },
            {
                bottomCorner: { x: quadrant.bottomCorner.x, y: quadrant.bottomCorner.y + halfHeight },
                topCorner: { x: quadrant.bottomCorner.x + halfWidth, y: quadrant.topCorner.y },
            },
            {
                bottomCorner: { x: quadrant.bottomCorner.x + halfWidth, y: quadrant.bottomCorner.y + halfHeight },
                topCorner: { x: quadrant.topCorner.x, y: quadrant.topCorner.y },
            },
        ];
        return subQuadrants;
    }
}
