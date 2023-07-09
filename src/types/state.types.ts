import { PSM } from "tesseract.js";

export type App = {
    active: boolean;
    displayMode: DisplayMode;
    scanState: ScanState;
};

export enum DisplayMode {
    CHARACTERS = 'Characters',
    WORDS = 'Words',
    LINES = 'Lines',
    PARAGRAPHS = 'Paragraphs',
    BLOCKS = 'Blocks',
};

export type ScanState = {
    scanned: boolean;
};

export type ExtensionSettings = {
    scanOnOpen: boolean;
    pageSegmentationMode: PSM;
};