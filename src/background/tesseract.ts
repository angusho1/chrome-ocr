import Tesseract, { createWorker } from "tesseract.js";
import { CHARACTER_MIN_CONFIDENCE, WORD_MIN_CONFIDENCE } from "../constants/tesseract.const";
import { ImageScanResults } from "../types/script.types";
import { ExtractTextOptions } from "../types/tesseract.types";

export const extractText = async (imgSrc: string, options?: ExtractTextOptions) => {
    const worker = await createWorker({
        workerPath: 'worker.min.js',
        workerBlobURL: false,
        langPath: 'lang-data',
        corePath: 'tesseract-core-simd.wasm.js',
        // logger: m => console.log(m)
    });
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    if (options) {
        await worker.setParameters({
            tessedit_pageseg_mode: options.psm || undefined,
        });
    }
    
    const res = await worker.recognize(imgSrc);
    console.log(res);
    
    await worker.terminate();

    return res.data;
};

export const parseExtractResult = (page: Tesseract.Page): ImageScanResults => {
    const characters = page.symbols
        .filter(symbol => symbol.confidence > CHARACTER_MIN_CONFIDENCE)
        .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));

    const words = page.words
        .filter(symbol => symbol.confidence > WORD_MIN_CONFIDENCE)
        .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));

    const lines = page.lines
        .filter(symbol => symbol.confidence > WORD_MIN_CONFIDENCE)
        .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));

    const paragraphs = page.paragraphs
        .filter(symbol => symbol.confidence > WORD_MIN_CONFIDENCE)
        .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));

    const blocks = page.blocks ? page.blocks
        .filter(symbol => symbol.confidence > WORD_MIN_CONFIDENCE)
        .map(symbol => ({ bbox: symbol.bbox, text: symbol.text })) : [];

    return {
        characters,
        words,
        lines,
        paragraphs,
        blocks,
    };
};