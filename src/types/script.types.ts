export type ScanPageResult = {
    imgSrcs: string[];
};

export type ImageScanResultsEntry = {
    imgSrc: string;
    tabId?: number;
    scanResults: ImageScanResults;
};

export type ImageScanResultsStore = {
    [imgSrc: string]: ImageScanResultsEntry;
};

export type ImageScanResults = {
    characters: Character[];
    words: Word[];
    lines: Line[];
    paragraphs: Paragraph[];
    blocks: Block[];
};

export type Snippet = {
    bbox: Tesseract.Bbox;
    text: string;
}

export type Character = Snippet & {
};

export type Word = Snippet & {
};

export type Line = Snippet & {
}

export type Paragraph = Snippet & {
}

export type Block = Snippet & {
}

export type ImageAttributes = {
    draggable?: boolean;
    touchAction?: string;
    pointerEvents?: string;
}