export enum ImageViewMode {
    OFF,
    SYMBOLS,
}

export type ExtensionState = {
    mode: ImageViewMode;
    scanned: boolean;
};