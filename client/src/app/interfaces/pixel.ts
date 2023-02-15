export interface Pixel {
    red: number;
    blue: number;
    green: number;
    alpha: number;
}

export interface GamePixels {
    leftImage: Pixel[];
    rightImage: Pixel[];
}
