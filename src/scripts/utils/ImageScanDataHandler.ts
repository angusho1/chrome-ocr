import { ChromeStorageKeys } from "../../constants/chrome-storage";
import { ImageScanaData, SymbolData } from "../../types/script.types";

class ImageScanDataHandler {
    private _imageScanData: ImageScanaData;
    private hasLoaded: boolean;

    constructor() {
        this._imageScanData = {};
        this.hasLoaded = false;
    }

    private async getStorageData() {
        const storageKey = ChromeStorageKeys.IMAGE_DATA_KEY;
        return (await chrome.storage.local.get([storageKey]))[storageKey];
    }

    public async loadStorageData() {
        const storageData = await this.getStorageData();
        this._imageScanData = storageData || {};
        this.hasLoaded = true;
    }

    public get(imgSrc: string) {
        return this._imageScanData[imgSrc];
    }

    public set(imgSrc: string, data: SymbolData[]) {
        this._imageScanData[imgSrc] = data;
    }

    public dataExists(imgSrc: string) {
        return imgSrc in this._imageScanData && !!this.get(imgSrc);
    }

    public async commit() {
        await chrome.storage.local.set({ [ChromeStorageKeys.IMAGE_DATA_KEY]: this._imageScanData });
    }
}

export const initImageScanDataHandler = async (): Promise<ImageScanDataHandler> => {
    const handler = new ImageScanDataHandler();
    await handler.loadStorageData();
    return handler;
};