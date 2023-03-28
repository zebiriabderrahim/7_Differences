export enum Action {
    ClicDiffFound = 'ClicDiffFound',
    ClicError = 'ClicError',
    CaptureMessage = 'CaptureMessage',
    ActivateCheat = 'ActivateCheat',
    DeactivateCheat = 'DeactivateCheat',
    UseHint = 'UseHint',
}

export interface ReplayAction {
    action: Action;
    timestamp: number;
}
