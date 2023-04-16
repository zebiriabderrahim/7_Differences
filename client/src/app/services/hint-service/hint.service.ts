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
import { SPEED_X1 } from '@app/constants/replay';
import { HintProximity } from '@app/enum/hint-proximity';
import { QuadrantPosition } from '@app/enum/quadrant-position';
import { ReplayActions } from '@app/enum/replay-actions';
import { Quadrant } from '@app/interfaces/quadrant';
import { CaptureService } from '@app/services/capture-service/capture.service';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { Coordinate } from '@common/coordinate';
@Injectable({
    providedIn: 'root',
})
export class HintService {
    nAvailableHints: number;
    thirdHintProximity: HintProximity;
    isThirdHintActive: boolean;
    private thirdHintProximityMatrix: HintProximity[][];

    // eslint-disable-next-line max-params
    constructor(
        private readonly gameManager: GameManagerService,
        private readonly gameAreaService: GameAreaService,
        private readonly differenceService: DifferenceService,
        private readonly captureService: CaptureService,
    ) {
        this.resetHints();
    }

    get differences(): Coordinate[][] {
        return this.gameManager.differences;
    }

    resetHints(): void {
        this.nAvailableHints = DEFAULT_N_HINTS;
        this.isThirdHintActive = false;
        this.thirdHintProximity = HintProximity.TooFar;
        this.thirdHintProximityMatrix = new Array(IMG_WIDTH)
            .fill(HintProximity.TooFar)
            .map(() => new Array(IMG_HEIGHT).fill(HintProximity.TooFar)) as HintProximity[][];
    }

    deactivateThirdHint(): void {
        this.isThirdHintActive = false;
        this.captureService.saveReplayEvent(ReplayActions.DeactivateThirdHint);
    }

    requestHint(replayDifference?: Coordinate[], flashingSpeed: number = SPEED_X1): void {
        if (this.nAvailableHints > 0 && this.differences.length > 0) {
            const difference: Coordinate[] = replayDifference
                ? replayDifference
                : this.differences[this.generateRandomIndex(this.differences.length)];
            if (this.nAvailableHints === LAST_HINT_NUMBER) {
                this.isThirdHintActive = true;
                this.generateLastHintDifferences(difference);
            } else {
                let hintQuadrant = this.generateHintQuadrant(difference, INITIAL_QUADRANT);
                if (this.nAvailableHints === SECOND_TO_LAST_HINT_NUMBER) {
                    hintQuadrant = this.generateHintQuadrant(difference, hintQuadrant);
                }
                this.gameAreaService.flashPixels(this.generateHintSquare(hintQuadrant), flashingSpeed);
            }
            this.captureService.saveReplayEvent(ReplayActions.UseHint, difference);
            this.gameManager.requestHint();
            this.nAvailableHints--;
        }
    }

    checkThirdHintProximity(coordinate: Coordinate): void {
        this.switchProximity(this.thirdHintProximityMatrix[coordinate.x][coordinate.y]);
    }

    switchProximity(nextProximity: HintProximity): void {
        if (nextProximity !== this.thirdHintProximity) {
            this.thirdHintProximity = nextProximity;
            this.captureService.saveReplayEvent(ReplayActions.ActivateThirdHint, nextProximity);
        }
    }

    private generateLastHintDifferences(difference: Coordinate[]): void {
        this.fillThirdHintProximityMatrix(difference, HintProximity.OnIt);
        this.fillThirdHintProximityMatrix(this.differenceService.enlargeDifferences(difference, SMALL_HINT_ENLARGEMENT), HintProximity.Close);
        this.fillThirdHintProximityMatrix(this.differenceService.enlargeDifferences(difference, LARGE_HINT_ENLARGEMENT), HintProximity.Far);
    }

    private fillThirdHintProximityMatrix(difference: Coordinate[], hintProximity: HintProximity): void {
        for (const coord of difference) {
            if (this.thirdHintProximityMatrix[coord.x][coord.y] === HintProximity.TooFar) {
                this.thirdHintProximityMatrix[coord.x][coord.y] = hintProximity;
            }
        }
    }

    private generateHintQuadrant(differencesCoordinates: Coordinate[], quadrant: Quadrant): Quadrant {
        const subQuadrants: Quadrant[] = this.generateSubQuadrants(quadrant);
        const quadrants: QuadrantPosition[] = [];
        for (const coord of differencesCoordinates) {
            for (const quadrantPosition of QUADRANT_POSITIONS) {
                if (!quadrants.includes(quadrantPosition) && this.isPointInQuadrant(coord, subQuadrants[quadrantPosition])) {
                    quadrants.push(quadrantPosition);
                }
            }
        }
        return subQuadrants[quadrants[this.generateRandomIndex(quadrants.length)]];
    }

    private generateRandomIndex(length: number) {
        return Math.floor(Math.random() * length);
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

    private generateSubQuadrants(quadrant: Quadrant): Quadrant[] {
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
