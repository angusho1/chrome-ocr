import { ChromeStorageKeys } from "../../constants/chrome-storage";
import { ImageScanResultsStore, ImageScanResultsEntry } from "../../types/script.types";

class ImageScanDataHandler {
    private _imageScanResultsStore: ImageScanResultsStore;
    private hasLoaded: boolean;

    constructor() {
        this._imageScanResultsStore = {};
        this.hasLoaded = false;
    }

    private async getStorageData() {
        const storageKey = ChromeStorageKeys.IMAGE_DATA_KEY;
        return (await chrome.storage.local.get([storageKey]))[storageKey];
    }

    public async loadStorageData() {
        const storageData = await this.getStorageData();
        this._imageScanResultsStore = storageData || {};
        this.hasLoaded = true;
    }

    public get(imgSrc: string) {
        return this._imageScanResultsStore[imgSrc];
    }

    public set(data: ImageScanResultsEntry) {
        const { imgSrc } = data;
        this._imageScanResultsStore[imgSrc] = data;
    }

    public getResultsForTab(tabId: number) {
        return Object.values(this._imageScanResultsStore).filter(entry => entry.tabId === tabId);
    }

    public dataExists(imgSrc: string) {
        return imgSrc in this._imageScanResultsStore && !!this.get(imgSrc);
    }

    public async commit() {
        await chrome.storage.local.set({ [ChromeStorageKeys.IMAGE_DATA_KEY]: this._imageScanResultsStore });
    }
}

export const initImageScanDataHandler = async (): Promise<ImageScanDataHandler> => {
    const handler = new ImageScanDataHandler();
    await handler.loadStorageData();
    return handler;
};