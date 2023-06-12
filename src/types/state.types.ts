export type App = {
    displayMode: DisplayMode;
    scanState: ScanState;
};

export enum DisplayMode {
    OFF,
    SYMBOLS,
};

export type ScanState = {
    scanned: boolean;
};

export type ExtensionSettings = {
    scanOnOpen: boolean;
};