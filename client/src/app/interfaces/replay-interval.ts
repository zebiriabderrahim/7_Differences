export interface ReplayInterval {
    start: () => void;
    pause: () => void;
    resume: () => void;
    cancel: () => void;
}
