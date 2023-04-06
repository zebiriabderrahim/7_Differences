import { Injectable } from '@angular/core';
import {
    DEFAULT_N_HINTS,
    HINT_SQUARE_PADDING,
    INITIAL_QUADRANT,
    LARGE_HINT_ENLARGEMENT,
    QUADRANT_POSITIONS,
    SMALL_HINT_ENLARGEMENT,
} from '@app/constants/hint';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { HintProximity } from '@app/enum/hint-proximity';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { QuadrantPosition } from '@app/enum/quadrant-position';
import { ReplayActions } from '@app/enum/replay-actions';
import { Quadrant } from '@app/interfaces/quadrant';
import { ReplayEvent } from '@app/interfaces/replay-actions';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { Coordinate } from '@common/coordinate';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class HintService {
    nAvailableHints: number;
    replayEventsSubject: Subject<ReplayEvent>;
    proximity: HintProximity;
    isThirdHintActive: boolean;
    private thirdHintDifference: boolean[][];
    private thirdHintDifferenceSlightlyEnlarged: boolean[][];
    private thirdHintDifferenceEnlarged: boolean[][];

    constructor(
        private readonly classicSystem: ClassicSystemService,
        private readonly gameAreaService: GameAreaService,
        private readonly differenceService: DifferenceService,
    ) {
        this.resetHints();
        this.proximity = HintProximity.TooFar;
        this.thirdHintDifference = this.differenceService.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        this.thirdHintDifferenceSlightlyEnlarged = this.differenceService.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        this.thirdHintDifferenceEnlarged = this.differenceService.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        this.replayEventsSubject = new Subject<ReplayEvent>();
    }

    get differences(): Coordinate[][] {
        return this.classicSystem.differences;
    }

    resetHints(): void {
        this.nAvailableHints = DEFAULT_N_HINTS;
        this.isThirdHintActive = false;
    }

    clickDuringThirdHint(): void {
        this.isThirdHintActive = false;
    }

    requestHint(): void {
        if (this.nAvailableHints > 0 && this.differences.length > 0) {
            let hintSquare: Coordinate[] = [];
            const differenceIndex: number = this.differences.length > 1 ? this.generateRandomNumber(0, this.differences.length - 1) : 0;
            const difference: Coordinate[] = this.differences[differenceIndex];
            if (this.nAvailableHints === 1) {
                this.isThirdHintActive = true;
                hintSquare = this.generateAdjustedHintSquare(difference);
                console.log('generateLastHintDifferences');
                this.generateLastHintDifferences(difference);
            } else {
                let hintQuadrant = this.getHintQuadrant(difference, INITIAL_QUADRANT);
                if (this.nAvailableHints === DEFAULT_N_HINTS - 1) {
                    hintQuadrant = this.getHintQuadrant(difference, hintQuadrant);
                }
                hintSquare = this.generateHintSquare(hintQuadrant);
            }
            const replayEvent: ReplayEvent = {
                action: ReplayActions.UseHint,
                timestamp: Date.now(),
                data: hintSquare,
            };
            this.replayEventsSubject.next(replayEvent);
            this.gameAreaService.flashCorrectPixels(hintSquare);
            this.classicSystem.requestHint();
            this.nAvailableHints--;
        }
    }

    checkThirdHint(coordinate: Coordinate): void {
        if (this.thirdHintDifferenceEnlarged[coordinate.x][coordinate.y]) {
            this.proximity = HintProximity.Far;
        } else if (this.thirdHintDifferenceSlightlyEnlarged[coordinate.x][coordinate.y]) {
            this.proximity = HintProximity.Close;
        } else if (this.thirdHintDifference[coordinate.x][coordinate.y]) {
            this.proximity = HintProximity.OnIt;
        } else {
            this.proximity = HintProximity.TooFar;
        }
    }

    private generateLastHintDifferences(difference: Coordinate[]): void {
        console.log('differences length: ' + difference.length);
        for (const coord of difference) {
            this.thirdHintDifference[coord.x][coord.y] = true;
        }
        const littleEnlarge = this.differenceService.enlargeDifferences(difference, SMALL_HINT_ENLARGEMENT);
        console.log('littleEnlarge length: ' + littleEnlarge.length);
        let littleTruth = 0;
        for (const coord of littleEnlarge) {
            if (!this.thirdHintDifference[coord.x][coord.y]) {
                littleTruth++;
                this.thirdHintDifferenceSlightlyEnlarged[coord.x][coord.y] = true;
            }
        }
        console.log('littleTruth: ' + littleTruth);
        const bigEnlarge = this.differenceService.enlargeDifferences(difference, LARGE_HINT_ENLARGEMENT);
        let bigTruth = 0;
        console.log('bigEnlarge length: ' + bigEnlarge.length);
        for (const coord of bigEnlarge) {
            if (!this.thirdHintDifference[coord.x][coord.y] && !this.thirdHintDifferenceSlightlyEnlarged[coord.x][coord.y]) {
                bigTruth++;
                this.thirdHintDifferenceEnlarged[coord.x][coord.y] = true;
            }
        }
        console.log('bigTruth: ' + bigTruth);
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

        return this.generateHintSquare({ bottomCorner: { x: minX, y: minY }, topCorner: { x: maxX, y: maxY } });
    }

    private generateHintSquare(quadrant: Quadrant): Coordinate[] {
        const hintSquare: Coordinate[] = [];
        const { topCorner, bottomCorner } = quadrant;

        for (let i = bottomCorner.x; i < topCorner.x + HINT_SQUARE_PADDING; i++) {
            for (let j = bottomCorner.y; j < topCorner.y + HINT_SQUARE_PADDING; j++) {
                const coordinate = { x: i, y: j };
                if (this.isCoordinateInHintSquare(coordinate, quadrant)) {
                    hintSquare.push(coordinate);
                }
            }
        }

        return hintSquare;
    }

    private isCoordinateValid(coordinate: Coordinate): boolean {
        return coordinate.x >= 0 && coordinate.y >= 0 && coordinate.x < IMG_WIDTH && coordinate.y < IMG_HEIGHT;
    }

    private isCoordinateInHintSquare(coordinate: Coordinate, quadrant: Quadrant): boolean {
        const { topCorner, bottomCorner } = quadrant;
        const { x, y } = coordinate;
        return (
            this.isCoordinateValid(coordinate) &&
            (x <= bottomCorner.x + HINT_SQUARE_PADDING || x >= topCorner.x || y <= bottomCorner.y + HINT_SQUARE_PADDING || y >= topCorner.y)
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

        const subQuadrants: Quadrant[] = [];
        subQuadrants[QuadrantPosition.First] = { bottomCorner: quadrant.bottomCorner, topCorner: middleCoordinate };
        subQuadrants[QuadrantPosition.Second] = {
            bottomCorner: { x: middleCoordinate.x, y: quadrant.bottomCorner.y },
            topCorner: { x: quadrant.topCorner.x, y: middleCoordinate.y },
        };
        subQuadrants[QuadrantPosition.Third] = {
            bottomCorner: { x: quadrant.bottomCorner.x, y: middleCoordinate.y },
            topCorner: { x: middleCoordinate.x, y: quadrant.topCorner.y },
        };
        subQuadrants[QuadrantPosition.Fourth] = { bottomCorner: middleCoordinate, topCorner: quadrant.topCorner };
        return subQuadrants;
    }
}
