export type ScanPageResult = {
    imgSrcs: string[];
};

export type ImageScanaData = {
    [imgSrc: string]: SymbolData[];
}

export type SymbolData = {
    bbox: Tesseract.Bbox;
    text: string;
};

export type ImageAttributes = {
    draggable?: boolean;
    touchAction?: string;
    pointerEvents?: string;
}