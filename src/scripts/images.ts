import { createWorker } from "tesseract.js";

export const getImages = () => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.map(img => img.src);
};

export const onImageSrcsRetrieved = (injectionResults: any) => {
    if (!injectionResults || !injectionResults.length) {
        console.log('No images found');
        return;
    }
    console.log('Image srcs', injectionResults);

    injectionResults.forEach((frame: any) => {
        frame.result.forEach((imgSrc: string) => extractText(imgSrc));
    });
};

const extractText = async (imgSrc: string) => {
    const worker = await createWorker({
        workerPath: 'worker.min.js',
        workerBlobURL: false,
        langPath: 'lang-data',
        corePath: 'tesseract-core-simd.wasm.js',
        logger: m => console.log(m)
    });
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const res = await worker.recognize(imgSrc);
    console.log(res);
    await worker.terminate();
};