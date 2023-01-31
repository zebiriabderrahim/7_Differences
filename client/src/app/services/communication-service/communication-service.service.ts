import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CarrouselPaginator, Game, GameConfigConst } from '@app/interfaces/game-interfaces';
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

    loadGameCarrousel(index: number): Observable<CarrouselPaginator> {
        return this.http
            .get<CarrouselPaginator>(`${this.gameUrl}/carrousel/${index}`)
            .pipe(catchError(this.handleError<CarrouselPaginator>('loadGameCarrousel')));
    }

    loadGameById(id: number): Observable<Game> {
        return this.http.get<Game>(`${this.gameUrl}/${id}`).pipe(catchError(this.handleError<Game>('loadGameById')));
    }

    postGame(gameData: Game): Observable<void> {
        return this.http.post<void>(`${this.gameUrl}`, gameData).pipe(catchError(this.handleError<void>('postGame')));
    }

    updateConfigConstants(constants: GameConfigConst): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/`, constants).pipe(catchError(this.handleError<void>('basicPut')));
    }

    loadConfigConstants(): Observable<GameConfigConst> {
        return this.http.get<GameConfigConst>(`${this.baseUrl}/constants`).pipe(catchError(this.handleError<GameConfigConst>('loadConfigConstants')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
