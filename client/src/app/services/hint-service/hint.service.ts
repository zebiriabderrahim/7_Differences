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

    get differences(): Coordinate[][] {
        return this.classicSystem.differences;
    }

    requestHint() {
        if (this.nAvailableHints > 0 && this.differences.length > 0) {
            let hintSquare: Coordinate[] = [];
            const differenceIndex: number = this.differences.length > 1 ? this.generateRandomNumber(0, this.differences.length - 1) : 0;
            const difference: Coordinate[] = this.differences[differenceIndex];
            if (this.nAvailableHints === 1) {
                hintSquare = this.generateAdjustedHintSquare(difference);
            } else {
                let hintQuadrant = this.getHintQuadrant(difference, INITIAL_QUADRANT);
                if (this.nAvailableHints === DEFAULT_N_HINTS - 1) {
                    hintQuadrant = this.getHintQuadrant(difference, hintQuadrant);
                }
                hintSquare = this.generateHintSquare(hintQuadrant);
            }
            this.gameAreaService.flashCorrectPixels(hintSquare);
            this.nAvailableHints--;
        }
    }

    private getHintQuadrant(differencesCoordinates: Coordinate[], quadrant: Quadrant): Quadrant {
        const subQuadrants: Quadrant[] = this.getSubQuadrants(quadrant);
        const quadrants: QuadrantPosition[] = [];
        for (const coord of differencesCoordinates) {
            if (!quadrants.includes(QuadrantPosition.First) && this.isPointInQuadrant(coord, subQuadrants[QuadrantPosition.First])) {
                quadrants.push(QuadrantPosition.First);
            } else if (!quadrants.includes(QuadrantPosition.Second) && this.isPointInQuadrant(coord, subQuadrants[QuadrantPosition.Second])) {
                quadrants.push(QuadrantPosition.Second);
            } else if (!quadrants.includes(QuadrantPosition.Third) && this.isPointInQuadrant(coord, subQuadrants[QuadrantPosition.Third])) {
                quadrants.push(QuadrantPosition.Third);
            } else if (!quadrants.includes(QuadrantPosition.Fourth) && this.isPointInQuadrant(coord, subQuadrants[QuadrantPosition.Fourth])) {
                quadrants.push(QuadrantPosition.Fourth);
            }
        }
        const quadrantNumber: number = quadrants.length > 1 ? this.generateRandomNumber(0, quadrants.length - 1) : 0;
        return subQuadrants[quadrants[quadrantNumber]];
    }

    private generateRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private generateAdjustedHintSquare(difference: Coordinate[]): Coordinate[] {
        const adjustedQuadrant = {
            bottomCorner: difference[0],
            topCorner: difference[0],
        };
        for (const coord of difference) {
            if (coord.x < adjustedQuadrant.bottomCorner.x) {
                adjustedQuadrant.bottomCorner.x = coord.x;
            } else if (coord.x > adjustedQuadrant.topCorner.x) {
                adjustedQuadrant.topCorner.x = coord.x;
            }
            if (coord.y < adjustedQuadrant.bottomCorner.y) {
                adjustedQuadrant.bottomCorner.y = coord.y;
            } else if (coord.y > adjustedQuadrant.topCorner.y) {
                adjustedQuadrant.topCorner.y = coord.y;
            }
        }
        return this.generateHintSquare(adjustedQuadrant);
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

    private isPointInQuadrant(point: Coordinate, quadrant: Quadrant): boolean {
        return (
            point.x >= quadrant.bottomCorner.x &&
            point.x <= quadrant.topCorner.x &&
            point.y >= quadrant.bottomCorner.y &&
            point.y <= quadrant.topCorner.y
        );
    }

    private getSubQuadrants(quadrant: Quadrant): Quadrant[] {
        const halfWidth = (quadrant.topCorner.x - quadrant.bottomCorner.x) / 2;
        const halfHeight = (quadrant.topCorner.y - quadrant.bottomCorner.y) / 2;
        const subQuadrants: Quadrant[] = [
            {
                bottomCorner: { x: quadrant.bottomCorner.x, y: quadrant.bottomCorner.y },
                topCorner: { x: quadrant.bottomCorner.x + halfWidth, y: quadrant.bottomCorner.y + halfHeight },
            },
            {
                bottomCorner: { x: quadrant.bottomCorner.x + halfWidth, y: quadrant.bottomCorner.y },
                topCorner: { x: quadrant.topCorner.x, y: quadrant.bottomCorner.y + halfHeight },
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
