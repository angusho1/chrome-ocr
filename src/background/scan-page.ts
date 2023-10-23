import Content from '../content/scripts';
import { extractText, parseExtractResult } from './tesseract';
import { executeScript } from '../utils/execute-script';
import { ExtractTextOptions } from '../types/tesseract.types';
import { initImageScanDataHandler } from '../utils/ImageScanDataHandler';
import { DisplayMode } from '../types/state.types';
import { Snippet } from '../types/script.types';
import { DEFAULT_APP_STATE } from '../constants/default-app.const';

type ScanImageOptions = {
    displayMode: DisplayMode;
    extractTextOptions?: ExtractTextOptions;
}

// TODO: This currently is not called from the background
export const scanImagesAndInsertText = async (options?: ScanImageOptions) => {
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
                    const res = await extractText(imgSrc, options?.extractTextOptions);
                    imageScanResults = parseExtractResult(res);

                    storage.set({
                        imgSrc,
                        tabId: tab.id,
                        scanResults: imageScanResults,
                    });
                } catch (e) {
                    console.log(`Couldn't extract text for image with src ${imgSrc}`, e);
                    return;
                }
            } else {
                imageScanResults = storage.get(imgSrc).scanResults;
            }

            let snippets: Snippet[];
            const displayMode = options?.displayMode ?? DEFAULT_APP_STATE.displayMode;

            switch (displayMode) {
                case DisplayMode.CHARACTERS:
                    snippets = imageScanResults.characters;
                    break;
                case DisplayMode.WORDS:
                    snippets = imageScanResults.words;
                    break;
                case DisplayMode.LINES:
                    snippets = imageScanResults.lines;
                    break;
                case DisplayMode.PARAGRAPHS:
                    snippets = imageScanResults.paragraphs;
                    break;
                case DisplayMode.BLOCKS:
                    snippets = imageScanResults.blocks;
                    break;
                default:
                    snippets = imageScanResults.words;
                    break;
            }

            await executeScript(Content.insertSnippets, [imgSrc, snippets]);
        })();
        jobs.push(job);
    });

    await Promise.all(jobs);
    await storage.commit();
}

const getImageSrcsFromPage = async (tab: chrome.tabs.Tab): Promise<string[]> => {
    const injectionResults = await chrome.scripting.executeScript({
        target: {
            tabId: tab.id as number,
            allFrames: true
        },
        func: Content.queryPageForImages,
    });

    if (!injectionResults || !injectionResults.length) {
        console.log('No images found');
        return [];
    }

    return injectionResults.map(frame => frame.result.imgSrcs).flat(1);
};
