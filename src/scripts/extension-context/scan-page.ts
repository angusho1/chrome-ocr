import { insertHtml } from '../page-context/insert-text';
import { getImageSrcsFromPage } from '../page-context/scan-page';
import { extractText } from './tesseract';
import { executeScript } from '../utils/execute-script';
import { ExtractTextOptions } from '../../types/tesseract.types';
import { initImageScanDataHandler } from '../utils/ImageScanDataHandler';

export const scanImagesAndInsertText = async (options?: ExtractTextOptions) => {
    const [tab] = await chrome.tabs.query({ active: true });

    const imageSrcs = await getImageSrcsFromPage(tab);

    const storage = await initImageScanDataHandler();

    const jobs: Promise<void>[] = [];
    imageSrcs.forEach(async (imgSrc) => {
        if (!imgSrc) return;

        const job = (async () => {
            let symbols;
            if (!storage.dataExists(imgSrc)) {
                try {
                    const res = await extractText(imgSrc, options);
                    symbols = res.symbols
                        .filter(symbol => symbol.confidence > 95)
                        .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));

                    storage.set(imgSrc, symbols);
                } catch (e) {
                    console.log(`Couldn't extract text for image with src ${imgSrc}`, e);
                    return;
                }
            } else {
                symbols = storage.get(imgSrc);
            }

            await executeScript(insertHtml, [imgSrc, symbols])
        })();
        jobs.push(job);
    });

    await Promise.all(jobs);
    await storage.commit();
}