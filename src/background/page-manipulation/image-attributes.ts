import { ChromeStorageKeys } from "../../constants/chrome-storage";
import { ImageAttributes } from "../../types/script.types";

export const getImageAttributes = async () => {
    return (await chrome.storage.local.get([ChromeStorageKeys.ImageInteractionAttributes]))[ChromeStorageKeys.ImageInteractionAttributes] || {};
};

export const setImageAttributes = async (imgSrc: string, attributes: ImageAttributes) => {
    const interactionAttributes = await getImageAttributes();

    interactionAttributes[imgSrc] = attributes;
    await chrome.storage.local.set({
        [ChromeStorageKeys.ImageInteractionAttributes]: interactionAttributes
    });
};
