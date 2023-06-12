import { ChromeStorageKeys } from "../../constants/chrome-storage";
import { DEFAULT_APP_STATE } from "../../constants/default-app.const";
import { DEFAULT_EXTENSION_SETTINGS } from "../../constants/default-settings.const";
import { KeyboardCommands } from "../../constants/keyboard-actions.const";
import { GetStateActions, PublishMessageActions, SetStateActions } from "../../constants/messaging.const";
import { hideScanResults, showScanResults } from "../../scripts/page-context/lifecycle";
import { executeScript } from "../../scripts/utils/execute-script";
import { ImageAttributes } from "../../types/script.types";
import { App, DisplayMode, ExtensionSettings } from "../../types/state.types";

let app: App = DEFAULT_APP_STATE;

export const sendMessage = (action: string, data: any) => {
    chrome.runtime.sendMessage({ action, data });
};

chrome.commands.onCommand.addListener((command) => {
    if (command === KeyboardCommands.TOGGLE_MODE) {
        if (!app.scanState.scanned) return;
        if (app.displayMode === DisplayMode.OFF) {
            executeScript(showScanResults);
            app.displayMode = DisplayMode.SYMBOLS;
        } else if (app.displayMode === DisplayMode.SYMBOLS) {
            executeScript(hideScanResults);
            app.displayMode = DisplayMode.OFF;
        }
        sendMessage(PublishMessageActions.PUBLISH_STATE, app);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case GetStateActions.GET_STATE:
            sendResponse(app);
            break;
        case SetStateActions.SET_STATE:
            app = message.data;
            sendMessage(PublishMessageActions.PUBLISH_STATE, app);
            break;
        case GetStateActions.GET_SETTINGS:
            getSettings(sendResponse);
            break;
        case SetStateActions.SET_SETTINGS:
            setExtensionSettings(message.data);
            sendMessage(PublishMessageActions.PUBLISH_SETTINGS, message.data);
            break;
        case 'GET_IMAGE_ATTRS':
            getImagesAttributes(sendResponse);
            break;
        case 'SET_IMAGE_ATTRS':
            setImageAttributes(message.data);
            break;
        default:
            console.log('Unknown action', message.action);
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

const getSettings = async (sendResponse: (res: any) => void) => {
    const settings = (await chrome.storage.sync.get([ChromeStorageKeys.EXTENSION_SETTINGS]))[ChromeStorageKeys.EXTENSION_SETTINGS] || DEFAULT_EXTENSION_SETTINGS;
    sendResponse(settings);
};

const setExtensionSettings = (settings: ExtensionSettings) => {
    chrome.storage.sync.set({ [ChromeStorageKeys.EXTENSION_SETTINGS]: settings });
};