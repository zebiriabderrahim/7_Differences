import { Injectable } from '@angular/core';
import { DEFAULT_N_HINTS } from '@app/constants/constants';

@Injectable({
    providedIn: 'root',
})
export class HintService {
    nAvailableHints: number;
    constructor() {
        this.nAvailableHints = DEFAULT_N_HINTS;
    }

    requestHint() {
        this.nAvailableHints--;
        console.log('Hint requested');
        console.log('Number of hints left: ' + this.nAvailableHints);
    }
}
