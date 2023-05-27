import { KeyboardCommands } from "../../constants/keyboard-actions.const";
import { BackgroundMessageActions, ExtensionMessageActions } from "../../constants/messaging.const";
import { hideScanResults, showScanResults } from "../../scripts/lifecycle";
import { ExtensionState, ImageViewMode } from "../../types/state.types";

let state: ExtensionState = {
    mode: ImageViewMode.OFF,
    scanned: false,
};

export const executeScript = async (func: () => void) => {
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
        target: {
            tabId: tab.id as number,
            allFrames: true
        },
        func,
    });
};

chrome.commands.onCommand.addListener(async (command) => {
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

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === ExtensionMessageActions.GET_STATE) {
        sendResponse(state);
    } else if (message.action === ExtensionMessageActions.SET_STATE) {
        state = message.data;
        chrome.runtime.sendMessage({ action: BackgroundMessageActions.UPDATE_STATE, data: state });
    }
});