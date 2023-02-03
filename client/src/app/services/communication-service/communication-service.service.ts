import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CarouselPaginator, Game, GameConfigConst } from '@app/interfaces/game-interfaces';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly gameUrl: string = environment.serverUrl + '/games';

    constructor(private readonly http: HttpClient) {}

    loadGameCarrousel(index: number): Observable<CarouselPaginator> {
        return this.http
            .get<CarouselPaginator>(`${this.gameUrl}/carousel/${index}`)
            .pipe(catchError(this.handleError<CarouselPaginator>('loadGameCarousel')));
    }

    loadGameById(id: number): Observable<Game> {
        return this.http.get<Game>(`${this.gameUrl}/${id}`).pipe(catchError(this.handleError<Game>('loadGameById')));
    }

    postGame(gameData: Game): Observable<void> {
        return this.http.post<void>(`${this.gameUrl}`, gameData).pipe(catchError(this.handleError<void>('postGame')));
    }

    loadConfigConstants(): Observable<GameConfigConst> {
        return this.http.get<GameConfigConst>(`${this.gameUrl}/constants`).pipe(catchError(this.handleError<GameConfigConst>('loadConfigConstants')));
    }

    private handleError<T>(_request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
