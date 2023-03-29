import { Injectable } from '@angular/core';
import { DEFAULT_N_HINTS, HINT_SQUARE_PADDING, INITIAL_QUADRANT, QUADRANT_POSITIONS } from '@app/constants/hint';
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
            for (const quadrantPosition of QUADRANT_POSITIONS) {
                if (!quadrants.includes(quadrantPosition) && this.isPointInQuadrant(coord, subQuadrants[quadrantPosition])) {
                    quadrants.push(quadrantPosition);
                }
            }
        }
        const quadrantNumber: number = quadrants.length > 1 ? this.generateRandomNumber(0, quadrants.length - 1) : 0;
        return subQuadrants[quadrants[quadrantNumber]];
    }

    private generateRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private generateAdjustedHintSquare(difference: Coordinate[]): Coordinate[] {
        let minX = difference[0].x;
        let minY = difference[0].y;
        let maxX = difference[0].x;
        let maxY = difference[0].y;

        for (const coord of difference) {
            minX = Math.min(minX, coord.x);
            minY = Math.min(minY, coord.y);
            maxX = Math.max(maxX, coord.x);
            maxY = Math.max(maxY, coord.y);
        }

        const adjustedQuadrant = {
            bottomCorner: { x: minX, y: minY },
            topCorner: { x: maxX, y: maxY },
        };
        return this.generateHintSquare(adjustedQuadrant);
    }

    private generateHintSquare(quadrant: Quadrant): Coordinate[] {
        const hintSquare: Coordinate[] = [];
        const { topCorner, bottomCorner } = quadrant;

        for (let i = bottomCorner.x - HINT_SQUARE_PADDING; i < topCorner.x + HINT_SQUARE_PADDING; i++) {
            for (let j = bottomCorner.y - HINT_SQUARE_PADDING; j < topCorner.y + HINT_SQUARE_PADDING; j++) {
                if (this.isCoordinateInHintSquare({ x: i, y: j }, quadrant)) {
                    hintSquare.push({ x: i, y: j });
                }
            }
        }

        return hintSquare;
    }

    private isCoordinateInHintSquare(coordinate: Coordinate, quadrant: Quadrant): boolean {
        const { topCorner, bottomCorner } = quadrant;
        const { x, y } = coordinate;
        return (
            (x >= bottomCorner.x && x < topCorner.x && (y === bottomCorner.y || y === topCorner.y - 1)) ||
            (y >= bottomCorner.y && y < topCorner.y && (x === bottomCorner.x || x === topCorner.x - 1))
        );
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
        const middleCoordinate: Coordinate = { x: quadrant.bottomCorner.x + halfWidth, y: quadrant.bottomCorner.y + halfHeight };

        const firstQuadrant: Quadrant = { bottomCorner: quadrant.bottomCorner, topCorner: middleCoordinate };
        const secondQuadrant: Quadrant = {
            bottomCorner: { x: middleCoordinate.x, y: quadrant.bottomCorner.y },
            topCorner: { x: quadrant.topCorner.x, y: middleCoordinate.y },
        };
        const thirdQuadrant: Quadrant = {
            bottomCorner: { x: quadrant.bottomCorner.x, y: middleCoordinate.y },
            topCorner: { x: middleCoordinate.x, y: quadrant.topCorner.y },
        };
        const fourthQuadrant: Quadrant = { bottomCorner: middleCoordinate, topCorner: quadrant.topCorner };

        const subQuadrants: Quadrant[] = [];
        subQuadrants[QuadrantPosition.First] = firstQuadrant;
        subQuadrants[QuadrantPosition.Second] = secondQuadrant;
        subQuadrants[QuadrantPosition.Third] = thirdQuadrant;
        subQuadrants[QuadrantPosition.Fourth] = fourthQuadrant;
        return subQuadrants;
    }
}
