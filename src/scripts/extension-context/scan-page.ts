import { insertHtml } from '../page-context/insert-text';
import { getImageSrcsFromPage } from '../page-context/scan-page';
import { extractText } from './tesseract';
import { ChromeStorageKeys } from '../../constants/chrome-storage';
import { executeScript } from '../utils/execute-script';
import { ExtractTextOptions } from '../../types/tesseract.types';

export const scanImagesAndInsertText = async (options?: ExtractTextOptions) => {
    const [tab] = await chrome.tabs.query({ active: true });

    const imageSrcs = await getImageSrcsFromPage(tab);

    const imageScanData = (await chrome.storage.local.get([ChromeStorageKeys.IMAGE_DATA_KEY]))[ChromeStorageKeys.IMAGE_DATA_KEY] || {};

    const jobs: Promise<void>[] = [];
    imageSrcs.forEach(async (imgSrc) => {
        if (!imgSrc) return;

        const job = (async () => {
            let symbols;
            if (!imageScanData[imgSrc]) {
                try {
                    const res = await extractText(imgSrc, options);
                    symbols = res.symbols
                        .filter(symbol => symbol.confidence > 95)
                        .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));
    
                    imageScanData[imgSrc] = symbols;
                } catch (e) {
                    console.log(`Couldn't extract text for image with src ${imgSrc}`, e);
                    return;
                }
            } else {
                symbols = imageScanData[imgSrc];
            }

            await executeScript(insertHtml, [imgSrc, symbols])
        })();
        jobs.push(job);
    });

    await Promise.all(jobs);
    await chrome.storage.local.set({ [ChromeStorageKeys.IMAGE_DATA_KEY]: imageScanData });
}