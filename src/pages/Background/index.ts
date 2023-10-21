import { ChromeStorageKeys } from "../../constants/chrome-storage";
import { DEFAULT_APP_STATE } from "../../constants/default-app.const";
import { DEFAULT_EXTENSION_SETTINGS } from "../../constants/default-settings.const";
import { KeyboardCommands } from "../../constants/keyboard-actions.const";
import { GetStateActions, PublishMessageActions, SetStateActions } from "../../constants/messaging.const";
import { clearSnippets, insertSnippets, removeSnippets, showScanResults } from "../../scripts/page-context/text-display";
import { executeScript } from "../../scripts/utils/execute-script";
import { initImageScanDataHandler } from "../../scripts/utils/ImageScanDataHandler";
import { ImageAttributes, ImageScanResults } from "../../types/script.types";
import { App, DisplayMode, ExtensionSettings } from "../../types/state.types";

let app: App = DEFAULT_APP_STATE;

export const sendMessage = (action: string, data: any) => {
    chrome.runtime.sendMessage({ action, data });
};

chrome.commands.onCommand.addListener((command) => {
    if (command === KeyboardCommands.TOGGLE_MODE) {
        if (!app.scanState.scanned) return;
        if (!app.active) {
            executeScript(showScanResults);
            app.active = true;
        } else {
            executeScript(removeSnippets);
            app.active = false;
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
            const prevDisplayMode = app.displayMode;
            app = message.data;
            if (prevDisplayMode !== app.displayMode) {
                displaySnippets();
            }
            sendMessage(PublishMessageActions.PUBLISH_STATE, app);
            break;
        case GetStateActions.GET_SETTINGS:
            getSettings(sendResponse);
            return true;
        case SetStateActions.SET_SETTINGS:
            setExtensionSettings(message.data);
            sendMessage(PublishMessageActions.PUBLISH_SETTINGS, message.data);
            break;
        case 'GET_IMAGE_ATTRS':
            getImagesAttributes(sendResponse);
            return true;
        case 'SET_IMAGE_ATTRS':
            setImageAttributes(message.data);
            break;
        default:
            console.log('Unknown action', message.action);
    }
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

const displaySnippets = async () => {
    const storage = await initImageScanDataHandler();
    const [tab] = await chrome.tabs.query({ active: true });

    if (tab.id) {
        executeScript(clearSnippets);

        const imageScanResults = storage.getResultsForTab(tab.id);
        imageScanResults.forEach(entry => {
            const snippets = getSnippets(entry.scanResults);
            executeScript(insertSnippets, [entry.imgSrc, snippets]);
        });
    }
};

const getSnippets = (imageScanResults: ImageScanResults) => {
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