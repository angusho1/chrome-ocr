import { ChromeStorageKeys } from "../../constants/chrome-storage";
import { KeyboardCommands } from "../../constants/keyboard-actions.const";
import { BackgroundMessageActions, ExtensionMessageActions } from "../../constants/messaging.const";
import { hideScanResults, showScanResults } from "../../scripts/page-context/lifecycle";
import { executeScript } from "../../scripts/utils/execute-script";
import { ImageAttributes } from "../../types/script.types";
import { ExtensionState, ImageViewMode } from "../../types/state.types";

let state: ExtensionState = {
    mode: ImageViewMode.OFF,
    scanned: false,
};

chrome.commands.onCommand.addListener((command) => {
    console.log(state);
    if (command === KeyboardCommands.TOGGLE_MODE) {
        if (!state.scanned) return;
        if (state.mode === ImageViewMode.OFF) {
            executeScript(showScanResults);
            state.mode = ImageViewMode.SYMBOLS;
        } else if (state.mode === ImageViewMode.SYMBOLS) {
            executeScript(hideScanResults);
            state.mode = ImageViewMode.OFF;
        }
        chrome.runtime.sendMessage({ action: BackgroundMessageActions.UPDATE_STATE, data: state });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === ExtensionMessageActions.GET_STATE) {
        sendResponse(state);
    } else if (message.action === ExtensionMessageActions.SET_STATE) {
        state = message.data;
        chrome.runtime.sendMessage({ action: BackgroundMessageActions.UPDATE_STATE, data: state });
    } else if (message.action === 'GET_IMAGE_ATTRS') {
        getImagesAttributes(sendResponse);
    } else if (message.action === 'SET_IMAGE_ATTRS') {
        setImageAttributes(message.data);
    }
    return true;
});

const getImagesAttributes = async (sendResponse: (res: any) => void) => {
    const interactionAttributes = (await chrome.storage.local.get([ChromeStorageKeys.IMAGE_INTERACTION_ATTR]))[ChromeStorageKeys.IMAGE_INTERACTION_ATTR] || {};
    console.log('interactionAttrs', interactionAttributes);
    sendResponse(interactionAttributes);
};

const setImageAttributes = async (data: { imgSrc: string, attributes: ImageAttributes }) => {
    const interactionAttributes = (await chrome.storage.local.get([ChromeStorageKeys.IMAGE_INTERACTION_ATTR]))[ChromeStorageKeys.IMAGE_INTERACTION_ATTR] || {};

    const { imgSrc, attributes } = data;
    interactionAttributes[imgSrc] = attributes;
    chrome.storage.local.set({ [ChromeStorageKeys.IMAGE_INTERACTION_ATTR]: interactionAttributes });
};