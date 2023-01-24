import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiConstants } from '@app/interfaces/api-constants';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Game } from 'src/app/interfaces/game';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl + 'api';
    private readonly gameUrl: string = this.baseUrl + 'game';

    constructor(private readonly http: HttpClient) {}

    fetchAllGames(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.gameUrl}`).pipe(catchError(this.handleError<Game[]>('fetchAllGames')));
    }

    getGameNames(): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/gameNames`).pipe(catchError(this.handleError<string[]>('getGameNames')));
    }

    fetchGame(id: number): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/game/:${id}`).pipe(catchError(this.handleError<Game>('fetchGame')));
    }

    postGame(gameData: Game): Observable<void> {
        return this.http.post<void>(`${this.gameUrl}`, gameData).pipe(catchError(this.handleError<void>('postGame')));
    }

    updateConfigConstants(constants: apiConstants): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/`, constants).pipe(catchError(this.handleError<void>('basicPut')));
    }

    fetchConfigConstants(): Observable<apiConstants> {
        return this.http.get<apiConstants>(`${this.baseUrl}/constants`).pipe(catchError(this.handleError<apiConstants>('basicPut')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
