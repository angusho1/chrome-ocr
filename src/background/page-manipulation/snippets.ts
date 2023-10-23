import Content from "../../content/scripts";
import { ImageScanResults } from "../../types/script.types";
import { DisplayMode } from "../../types/state.types";
import { initImageScanDataHandler } from "../../utils/ImageScanDataHandler";
import { executeScript } from "../../utils/execute-script";
import { getAppState } from "../app-state";

export const displaySnippets = async () => {
    const storage = await initImageScanDataHandler();
    const [tab] = await chrome.tabs.query({ active: true });

    if (tab.id) {
        executeScript(Content.clearSnippets);

        const imageScanResults = storage.getResultsForTab(tab.id);
        imageScanResults.forEach(entry => {
            const snippets = getSnippets(entry.scanResults);
            executeScript(Content.insertSnippets, [entry.imgSrc, snippets]);
        });
    }
};

export const toggleMode = () => {
    const app = getAppState();

    if (!app.scanState.scanned) return;
    if (!app.active) {
        executeScript(Content.showScanResults);
        app.active = true;
    } else {
        executeScript(Content.removeSnippets);
        app.active = false;
    }  
};

const getSnippets = (imageScanResults: ImageScanResults) => {
    const app = getAppState();

    switch (app.displayMode) {
        case DisplayMode.CHARACTERS:
            return imageScanResults.characters;
        case DisplayMode.WORDS:
            return imageScanResults.words;
        case DisplayMode.LINES:
            return imageScanResults.lines;
        case DisplayMode.PARAGRAPHS:
            return imageScanResults.paragraphs;
        case DisplayMode.BLOCKS:
            return imageScanResults.blocks;
        default:
            return imageScanResults.words;
    }
}