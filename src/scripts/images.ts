import Tesseract, { createWorker } from "tesseract.js";
import { ScanPageResult, SymbolData } from "../types/script.types";

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

export const insertHtml = (imgSrc: string, symbols: SymbolData[]) => {
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

        const wrapper = document.createElement('div');
        wrapper.className = 'ocr-overlay-wrapper';
        
        symbols.forEach((symbol, index) => {
            const bbox = symbol.bbox;
            const div = document.createElement('div');
            div.style.border = '1px solid red';
            div.style.position = 'absolute';
            div.style.left = `${imgRect.left + window.scrollX + (bbox.x0 * widthScale)}px`;
            div.style.top = `${imgRect.top + window.scrollY + (bbox.y0 * heightScale)}px`;
            div.style.width = `${(bbox.x1 - bbox.x0) * widthScale}px`;
            const scaledBboxHeight = (bbox.y1 - bbox.y0) * heightScale;
            div.style.height = `${scaledBboxHeight}px`;
            
            div.innerText = symbol.text;
            div.style.color = 'rgba(0, 0, 0, 0)';
            div.style.fontSize = `${scaledBboxHeight}px`;

            const before = document.createElement('div');
            before.style.content = '""';
            before.style.position = 'absolute';
            before.style.top = '-5px';
            before.style.left = '-5px';
            before.style.width = 'calc(100% + 10px)';
            before.style.height = 'calc(100% + 10px)';
            before.style.zIndex = '-1';
            before.style.backgroundColor = 'transparent';
            before.style.pointerEvents = 'none';
            div.appendChild(before);

            const after = document.createElement('div');
            after.style.content = '""';
            after.style.position = 'absolute';
            after.style.bottom = '-5px';
            after.style.right = '-5px';
            after.style.width = 'calc(100% + 10px)';
            after.style.height = 'calc(100% + 10px)';
            after.style.zIndex = '-1';
            after.style.backgroundColor = 'transparent';
            after.style.pointerEvents = 'none';
            div.appendChild(after);

            wrapper.appendChild(div);
        });

        document.body.appendChild(wrapper);
    }
};