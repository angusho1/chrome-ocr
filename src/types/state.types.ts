export type App = {
    displayMode: DisplayMode;
    scanState: ScanState;
    settings: ExtensionSettings;
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