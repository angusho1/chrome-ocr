import { insertHtml } from '../page-context/insert-text';
import { getImageSrcsFromPage } from '../page-context/scan-page';
import { extractText, parseExtractResult } from './tesseract';
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
            let imageScanResults;
            if (!storage.dataExists(imgSrc)) {
                try {
                    const res = await extractText(imgSrc, options);
                    imageScanResults = parseExtractResult(res);

                    storage.set(imgSrc, imageScanResults);
                } catch (e) {
                    console.log(`Couldn't extract text for image with src ${imgSrc}`, e);
                    return;
                }
            } else {
                imageScanResults = storage.get(imgSrc);
            }

            // TODO: Specify the type of snippet to pass in
            await executeScript(insertHtml, [imgSrc, imageScanResults.characters])
        })();
        jobs.push(job);
    });

    await Promise.all(jobs);
    await storage.commit();
}