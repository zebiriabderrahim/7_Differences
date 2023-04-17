import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameDetails } from '@app/interfaces/game-interfaces';
import { CarouselPaginator, GameConfigConst, GameHistory } from '@common/game-interfaces';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly gameUrl: string;

    constructor(private readonly http: HttpClient) {
        this.gameUrl = environment.serverUrl + '/games';
    }

    loadGameCarrousel(index: number): Observable<CarouselPaginator> {
        return this.http
            .get<CarouselPaginator>(`${this.gameUrl}/carousel/${index}`)
            .pipe(catchError(this.handleError<CarouselPaginator>('loadGameCarousel')));
    }

    postGame(gameData: GameDetails): Observable<void> {
        return this.http.post<void>(`${this.gameUrl}`, gameData).pipe(catchError(this.handleError<void>('postGame')));
    }

    loadConfigConstants(): Observable<GameConfigConst> {
        return this.http.get<GameConfigConst>(`${this.gameUrl}/constants`).pipe(catchError(this.handleError<GameConfigConst>('loadConfigConstants')));
    }

    loadGameHistory(): Observable<GameHistory[]> {
        return this.http.get<GameHistory[]>(`${this.gameUrl}/history`).pipe(catchError(this.handleError<GameHistory[]>('loadGameHistory')));
    }

    deleteGameById(id: string): Observable<void> {
        return this.http.delete<void>(`${this.gameUrl}/${id}`).pipe(catchError(this.handleError<void>('deleteGameById')));
    }

    deleteAllGames(): Observable<void> {
        return this.http.delete<void>(`${this.gameUrl}`).pipe(catchError(this.handleError<void>('deleteAllGames')));
    }

    deleteAllGamesHistory(): Observable<void> {
        return this.http.delete<void>(`${this.gameUrl}/history`).pipe(catchError(this.handleError<void>('deleteAllGamesHistory')));
    }

    verifyIfGameExists(name: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.gameUrl}/?name=${name}`).pipe(catchError(this.handleError<boolean>('verifyIfGameExists')));
    }

    updateGameConstants(gameConstants: GameConfigConst): Observable<void> {
        return this.http.put<void>(`${this.gameUrl}/constants`, gameConstants).pipe(catchError(this.handleError<void>('updateGameConstants')));
    }

    private handleError<T>(_request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
