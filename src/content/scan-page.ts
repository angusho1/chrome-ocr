import { ScanPageResult } from "../types/script.types";

export const getImageSrcsFromPage = async (tab: chrome.tabs.Tab): Promise<string[]> => {
    const injectionResults = await chrome.scripting.executeScript({
        target: {
            tabId: tab.id as number,
            allFrames: true
        },
        func: queryPageForImages,
    });

    if (!injectionResults || !injectionResults.length) {
        console.log('No images found');
        return [];
    }

    return injectionResults.map(frame => frame.result.imgSrcs).flat(1);
};

export const queryPageForImages = (): ScanPageResult => {
    const images = Array.from(document.querySelectorAll('img'));
    return {
        imgSrcs: images.map(img => img.src),
    };
};
