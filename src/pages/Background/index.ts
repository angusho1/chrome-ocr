import { ChromeStorageKeys } from "../../constants/chrome-storage";
import { DEFAULT_APP_STATE } from "../../constants/default-app.const";
import { KeyboardCommands } from "../../constants/keyboard-actions.const";
import { GetStateActions, PublishMessageActions, SetStateActions } from "../../constants/messaging.const";
import { hideScanResults, showScanResults } from "../../scripts/page-context/lifecycle";
import { executeScript } from "../../scripts/utils/execute-script";
import { ImageAttributes } from "../../types/script.types";
import { App, DisplayMode } from "../../types/state.types";

let app: App = DEFAULT_APP_STATE;

chrome.commands.onCommand.addListener((command) => {
    console.log(app);
    if (command === KeyboardCommands.TOGGLE_MODE) {
        if (!app.scanState.scanned) return;
        if (app.displayMode === DisplayMode.OFF) {
            executeScript(showScanResults);
            app.displayMode = DisplayMode.SYMBOLS;
        } else if (app.displayMode === DisplayMode.SYMBOLS) {
            executeScript(hideScanResults);
            app.displayMode = DisplayMode.OFF;
        }
        chrome.runtime.sendMessage({ action: PublishMessageActions.PUBLISH_STATE, data: app });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === GetStateActions.GET_STATE) {
        sendResponse(app);
    } else if (message.action === SetStateActions.SET_STATE) {
        app = message.data;
        chrome.runtime.sendMessage({ action: PublishMessageActions.PUBLISH_STATE, data: app });
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