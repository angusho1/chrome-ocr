import { ChromeStorageKeys } from "../../constants/chrome-storage";
import { DEFAULT_EXTENSION_SETTINGS } from "../../constants/default-settings.const";
import { ExtensionSettings } from "../../types/state.types";

export const setExtensionSettings = (settings: ExtensionSettings) => {
    chrome.storage.sync.set({ [ChromeStorageKeys.ExtensionSettings]: settings });
};

export const getExtensionSettings = async () => {
    const settings = (await chrome.storage.sync.get([ChromeStorageKeys.ExtensionSettings]))[ChromeStorageKeys.ExtensionSettings] || DEFAULT_EXTENSION_SETTINGS;
    return settings;
};
