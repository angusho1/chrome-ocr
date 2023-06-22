import { createWorker } from "tesseract.js";
import { ExtractTextOptions } from "../../types/tesseract.types";

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