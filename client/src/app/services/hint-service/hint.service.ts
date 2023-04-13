import { Injectable } from '@angular/core';
import {
    DEFAULT_N_HINTS,
    HINT_SQUARE_PADDING,
    INITIAL_QUADRANT,
    LARGE_HINT_ENLARGEMENT,
    LAST_HINT_NUMBER,
    QUADRANT_POSITIONS,
    SECOND_TO_LAST_HINT_NUMBER,
    SMALL_HINT_ENLARGEMENT,
} from '@app/constants/hint';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { HintProximity } from '@app/enum/hint-proximity';
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
        this.resetThirdHint();
        this.replayEventsSubject = new Subject<ReplayEvent>();
    }

    get differences(): Coordinate[][] {
        return this.classicSystem.differences;
    }

    resetHints(): void {
        this.nAvailableHints = DEFAULT_N_HINTS;
        this.isThirdHintActive = false;
    }

    resetThirdHint(): void {
        this.proximity = HintProximity.TooFar;
        this.thirdHintDifference = this.differenceService.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        this.thirdHintDifferenceSlightlyEnlarged = this.differenceService.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        this.thirdHintDifferenceEnlarged = this.differenceService.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
    }

    clickDuringThirdHint(): void {
        this.isThirdHintActive = false;
        const replayEvent: ReplayEvent = {
            action: ReplayActions.DeactivateThirdHint,
            timestamp: Date.now(),
        };
        this.replayEventsSubject.next(replayEvent);
    }

    requestHint(replayDifference?: Coordinate[], replaySpeed?: number): void {
        const speed = replaySpeed ? replaySpeed : 1;
        if (this.nAvailableHints > 0 && this.differences.length > 0) {
            const differenceIndex: number = this.differences.length > 1 ? this.generateRandomNumber(0, this.differences.length - 1) : 0;
            const difference: Coordinate[] = replayDifference ? replayDifference : this.differences[differenceIndex];
            if (this.nAvailableHints === LAST_HINT_NUMBER) {
                this.isThirdHintActive = true;
                this.generateLastHintDifferences(difference);
            } else {
                let hintQuadrant = this.getHintQuadrant(difference, INITIAL_QUADRANT);
                if (this.nAvailableHints === SECOND_TO_LAST_HINT_NUMBER) {
                    hintQuadrant = this.getHintQuadrant(difference, hintQuadrant);
                }
                this.gameAreaService.flashCorrectPixels(this.generateHintSquare(hintQuadrant), speed);
            }
            const replayEvent: ReplayEvent = {
                action: ReplayActions.UseHint,
                timestamp: Date.now(),
                data: difference,
            };
            this.replayEventsSubject.next(replayEvent);
            this.classicSystem.requestHint();
            this.nAvailableHints--;
        }
    }

    checkThirdHint(coordinate: Coordinate): void {
        if (this.thirdHintDifferenceEnlarged[coordinate.x][coordinate.y]) {
            this.switchProximity(HintProximity.Far);
        } else if (this.thirdHintDifferenceSlightlyEnlarged[coordinate.x][coordinate.y]) {
            this.switchProximity(HintProximity.Close);
        } else if (this.thirdHintDifference[coordinate.x][coordinate.y]) {
            this.switchProximity(HintProximity.OnIt);
        } else {
            this.switchProximity(HintProximity.TooFar);
        }
    }

    switchProximity(nextProximity: HintProximity): void {
        if (nextProximity !== this.proximity) {
            this.proximity = nextProximity;
            const replayEvent: ReplayEvent = {
                action: ReplayActions.ActivateThirdHint,
                timestamp: Date.now(),
                data: nextProximity,
            };
            this.replayEventsSubject.next(replayEvent);
        }
    }

    private generateLastHintDifferences(difference: Coordinate[]): void {
        this.resetThirdHint();
        for (const coord of difference) {
            this.thirdHintDifference[coord.x][coord.y] = true;
        }
        const littleEnlarge = this.differenceService.enlargeDifferences(difference, SMALL_HINT_ENLARGEMENT);
        for (const coord of littleEnlarge) {
            if (!this.thirdHintDifference[coord.x][coord.y]) {
                this.thirdHintDifferenceSlightlyEnlarged[coord.x][coord.y] = true;
            }
        }
        const bigEnlarge = this.differenceService.enlargeDifferences(difference, LARGE_HINT_ENLARGEMENT);
        for (const coord of bigEnlarge) {
            if (!this.thirdHintDifference[coord.x][coord.y] && !this.thirdHintDifferenceSlightlyEnlarged[coord.x][coord.y]) {
                this.thirdHintDifferenceEnlarged[coord.x][coord.y] = true;
            }
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
        const isCoordinateInXValidRange: boolean = x <= bottomCorner.x + HINT_SQUARE_PADDING || x >= topCorner.x;
        const isCoordinateInYValidRange: boolean = y <= bottomCorner.y + HINT_SQUARE_PADDING || y >= topCorner.y;
        return this.isCoordinateValid(coordinate) && (isCoordinateInXValidRange || isCoordinateInYValidRange);
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
