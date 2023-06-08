import { createWorker } from "tesseract.js";

export const extractText = async (imgSrc: string) => {
    const worker = await createWorker({
        workerPath: 'worker.min.js',
        workerBlobURL: false,
        langPath: 'lang-data',
        corePath: 'tesseract-core-simd.wasm.js',
        // logger: m => console.log(m)
    });
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const res = await worker.recognize(imgSrc);
    console.log(res);
    
    await worker.terminate();

    return res.data;
};