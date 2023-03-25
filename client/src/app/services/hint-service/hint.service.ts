import { Injectable } from '@angular/core';
import { DEFAULT_N_HINTS } from '@app/constants/constants';
import { Quadrant } from '@app/enum/quadrant';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { Coordinate } from '@common/coordinate';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { IMG_HEIGHT, IMG_WIDTH, HALF_HEIGHT, HALF_WIDTH } from '@app/constants/image';
@Injectable({
    providedIn: 'root',
})
export class HintService {
    nAvailableHints: number;
    constructor(private readonly classicSystem: ClassicSystemService, private readonly gameAreaService: GameAreaService) {
        this.nAvailableHints = DEFAULT_N_HINTS;
    }

    requestHint() {
        this.displayFirstHint(this.classicSystem.cheatDifferences);
        this.nAvailableHints--;
    }

    private displayFirstHint(differencesCoordinates: Coordinate[]) {
        const quadrantCorners: Coordinate[][] = [
            [
                { x: HALF_WIDTH, y: HALF_HEIGHT },
                { x: IMG_WIDTH, y: IMG_HEIGHT },
            ],
            [
                { x: 0, y: HALF_HEIGHT },
                { x: HALF_WIDTH, y: HALF_HEIGHT },
            ],
            [
                { x: 0, y: 0 },
                { x: HALF_WIDTH, y: HALF_HEIGHT },
            ],
            [
                { x: HALF_WIDTH, y: 0 },
                { x: IMG_WIDTH, y: HALF_HEIGHT },
            ],
        ];
        const sortedDifferences = differencesCoordinates.sort((a, b) => a.x - b.x);
        const quadrants: Quadrant[] = [];
        for (const coord of sortedDifferences) {
            if (coord.x > HALF_WIDTH) {
                if (!quadrants.includes(Quadrant.First) && coord.y > HALF_WIDTH) {
                    quadrants.push(Quadrant.First);
                } else if (!quadrants.includes(Quadrant.Fourth)) {
                    quadrants.push(Quadrant.Fourth);
                }
            } else {
                if (!quadrants.includes(Quadrant.Second) && coord.y > HALF_WIDTH) {
                    quadrants.push(Quadrant.Second);
                } else if (!quadrants.includes(Quadrant.Third)) {
                    quadrants.push(Quadrant.Third);
                }
            }
        }
        const quadrantNumber: number = quadrants.length > 1 ? this.generateRandomNumber(0, quadrants.length - 1) : 0;
        const corners = quadrantCorners[quadrantNumber];
        this.gameAreaService.flashCorrectPixels(this.generateHintSquare(corners[0], corners[1]));
    }

    // private calculateSecondHint() {
    //     const secondDifference = this.differencesCoordinates[1];
    //     this.classicSystem.cheatDifferences = [secondDifference];
    // }

    // private displayThirdHint(differencesCoordinates: Coordinate[]) {
    //     const randomDifference = differencesCoordinates[Math.floor(Math.random() * differencesCoordinates.length)];
    //     randomDifference.x = randomDifference.x * 2;
    //     const hintSquare: Coordinate[] = [];
    //     for (let i = 0; i < 300; i++) {
    //         for (let j = 0; j < 300; j++) {
    //             hintSquare.push({ x: i, y: j });
    //         }
    //     }
    //     this.gameAreaService.flashCorrectPixels(hintSquare);
    // }

    private generateRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private generateHintSquare(bottomCorner: Coordinate, topCorner: Coordinate): Coordinate[] {
        const hintSquare: Coordinate[] = [];
        for (let i = bottomCorner.x; i < topCorner.x; i++) {
            for (let j = bottomCorner.y; j < topCorner.y; j++) {
                hintSquare.push({ x: i, y: j });
            }
        }
        return hintSquare;
    }
}
