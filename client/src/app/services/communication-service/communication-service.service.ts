import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CarrouselPaginator, Game, GameConfig, GameDetails } from '@app/interfaces/game-interfaces';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly gameUrl: string = environment.serverUrl + '/games';

    constructor(private readonly http: HttpClient) {}

    loadGameCarrousel(index: number): Observable<CarrouselPaginator> {
        return this.http
            .get<CarrouselPaginator>(`${this.gameUrl}/carrousel/${index}`)
            .pipe(catchError(this.handleError<CarrouselPaginator>('loadGameCarrousel')));
    }

    loadGameById(id: number): Observable<Game> {
        return this.http.get<Game>(`${this.gameUrl}/${id}`).pipe(catchError(this.handleError<Game>('loadGameById')));
    }

    postGame(gameData: GameDetails): Observable<void> {
        return this.http.post<void>(`${this.gameUrl}`, gameData).pipe(catchError(this.handleError<void>('postGame')));
    }

    loadConfigConstants(): Observable<GameConfig> {
        return this.http.get<GameConfig>(`${this.gameUrl}/constants`).pipe(catchError(this.handleError<GameConfig>('loadConfigConstants')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
