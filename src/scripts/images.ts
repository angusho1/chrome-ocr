import Tesseract, { createWorker } from "tesseract.js";
import { ScanPageResult } from "../types/script.types";

export const scanPage = (): ScanPageResult => {
    const images = Array.from(document.querySelectorAll('img'));
    return {
        imgSrcs: images.map(img => img.src),
    };
};

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

export const insertHtml = (imgSrc: string, symbols: {bbox: Tesseract.Bbox}[]) => {
    const imgNode = Array.from(document.querySelectorAll('img')).find(img => img.src === imgSrc);
    if (imgNode) {
        imgNode.ondragstart = (e) => e.preventDefault();
        imgNode.onclick = (e) => e.preventDefault();
        imgNode.addEventListener('click', function(event) {
            event.preventDefault();
        }, { passive: false });
        imgNode.style.touchAction = 'none';
        imgNode.style.pointerEvents = 'none';

        const imgRect = imgNode.getBoundingClientRect();
        const widthScale = imgNode.width / imgNode.naturalWidth;
        const heightScale = imgNode.height / imgNode.naturalHeight;
        
        symbols.forEach((symbol, index) => {
            const bbox = symbol.bbox;
            const div = document.createElement('div');
            div.style.border = '1px solid red';
            div.style.position = 'absolute';
            div.style.left = `${imgRect.left + (bbox.x0 * widthScale)}px`;
            div.style.top = `${imgRect.top + (bbox.y0 * heightScale)}px`;
            div.style.width = `${(bbox.x1 - bbox.x0) * widthScale}px`;
            div.style.height = `${(bbox.y1 - bbox.y0) * heightScale}px`;
            document.body.appendChild(div);
        });
    }
};