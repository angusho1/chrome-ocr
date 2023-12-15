import { KeyboardCommands } from "../constants/keyboard-actions.const";
import { GetStateActions, ImageAttributeActions, PublishMessageActions, SetStateActions } from "../constants/messaging.const";
import { sendMessage } from "./messaging/utils";
import { getExtensionSettings, setExtensionSettings } from "./extension-settings";
import { getImageAttributes, setImageAttributes } from "./page-manipulation/image-attributes";
import { displaySnippets, toggleMode } from "./page-manipulation/snippets";
import { getAppState, setAppState } from "./app-state";
import { App } from "../types/state.types";

chrome.commands.onCommand.addListener((command) => {
    const app = getAppState();

    if (command === KeyboardCommands.ToggleMode) {
        console.log('app beforehand', app);
        toggleMode();
        console.log('app after', app);
        sendMessage(PublishMessageActions.PublishAppState, app);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let app: App;

    switch (message.action) {
        case GetStateActions.GetAppState:
            app = getAppState();
            sendResponse(app);
            break;
        case SetStateActions.SetAppState:
            const prevAppState = getAppState();
            setAppState(message.data);
            app = getAppState();
            if (prevAppState.displayMode !== app.displayMode) {
                displaySnippets();
            }
            sendMessage(PublishMessageActions.PublishAppState, app);
            break;
        case GetStateActions.GetSettings:
            getSettings(sendResponse);
            return true;
        case SetStateActions.SetSettings:
            setExtensionSettings(message.data);
            sendMessage(PublishMessageActions.PublishSettings, message.data);
            break;
        case ImageAttributeActions.GetImageAttributes:
            getImagesAttributes(sendResponse);
            return true;
        case ImageAttributeActions.SetImageAttributes:
            const { imgSrc, attributes } = message.data;
            setImageAttributes(imgSrc, attributes);
            break;
        default:
            console.log('Unknown action', message.action);
    }
});

const getImagesAttributes = async (sendResponse: (res: any) => void) => {
    const interactionAttributes = await getImageAttributes();
    sendResponse(interactionAttributes);
};

const getSettings = async (sendResponse: (res: any) => void) => {
    const settings = await getExtensionSettings();
    sendResponse(settings);
};
