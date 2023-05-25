import { KeyboardCommands } from "../../constants/keyboard-actions.const";
import { BackgroundMessageActions, ExtensionMessageActions } from "../../constants/messaging.const";
import { hideScanResults } from "../../scripts/lifecycle";
import { ExtensionState, ImageViewMode } from "../../types/state.types";

const state: ExtensionState = {
    mode: ImageViewMode.OFF,
    scanned: false,
};

chrome.commands.onCommand.addListener(async (command) => {
    if (command === KeyboardCommands.TOGGLE_MODE) {
        if (state.mode === ImageViewMode.OFF) {
            state.mode = ImageViewMode.SYMBOLS;
        } else if (state.mode === ImageViewMode.SYMBOLS) {
            const [tab] = await chrome.tabs.query({ active: true });
            chrome.scripting.executeScript({
                target: {
                    tabId: tab.id as number,
                    allFrames: true
                },
                func: hideScanResults,
            });
            state.mode = ImageViewMode.OFF;
        }
        chrome.runtime.sendMessage({ action: BackgroundMessageActions.UPDATE_STATE, data: state });
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === ExtensionMessageActions.GET_STATE) {
        sendResponse(state);
    } else if (message.action === ExtensionMessageActions.SET_SCANNED) {
        state.scanned = true;
    }
});