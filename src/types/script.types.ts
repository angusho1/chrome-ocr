export type ScanPageResult = {
    imgSrcs: string[];
};

export type SymbolData = {
    bbox: Tesseract.Bbox;
    text: string;
};