import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, GameConst, GameDetails } from '@app/interfaces/game-interfaces';
import { GameCard } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly gameUrl: string = this.baseUrl + '/games';

    constructor(private readonly http: HttpClient) {}

    loadAllGames(): Observable<GameCard[]> {
        return this.http.get<GameCard[]>(`${this.gameUrl}`).pipe(catchError(this.handleError<GameCard[]>('loadAllGames')));
    }

    getGameNames(): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/gameNames`).pipe(catchError(this.handleError<string[]>('getGameNames')));
    }

    loadGameById(id: number): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/games/:${id}`).pipe(catchError(this.handleError<Game>('loadGameById')));
    }

    postGame(gameData: GameDetails): Observable<void> {
        return this.http.post<void>(`${this.gameUrl}`, gameData).pipe(catchError(this.handleError<void>('postGame')));
    }

    updateConfigConstants(constants: GameConst): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/`, constants).pipe(catchError(this.handleError<void>('basicPut')));
    }

    loadConfigConstants(): Observable<GameConst> {
        return this.http.get<GameConst>(`${this.baseUrl}/constants`).pipe(catchError(this.handleError<GameConst>('loadConfigConstants')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
