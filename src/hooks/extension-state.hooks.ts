import { useEffect, useState } from "react";
import { ExtensionState, ImageViewMode } from "../types/state.types";
import { BackgroundMessageActions, ExtensionMessageActions } from "../constants/messaging.const";

export type ExtensionStateResult = {
    extensionState: ExtensionState;
    setState: (state: ExtensionState) => void;
}

export const useExtensionState = (): ExtensionStateResult => {
    const [extensionState, setExtensionState] = useState<ExtensionState | undefined>(undefined);

    const setState = (state: ExtensionState) => {
        chrome.runtime.sendMessage({ action: ExtensionMessageActions.SET_STATE, data:  state });
    };

    useEffect(() => {
        chrome.runtime.onMessage.addListener(function(message) {
            if (message.action === BackgroundMessageActions.UPDATE_STATE) {
                const state = message.data;
                setExtensionState(state);
            }
        });
    }, []);

    useEffect(() => {
        if (!extensionState) {
            chrome.runtime.sendMessage({ action: ExtensionMessageActions.GET_STATE })
                .then(state => setExtensionState(state));
        }
    }, [extensionState]);

    return {
        extensionState: extensionState || { mode: ImageViewMode.OFF, scanned: false },
        setState,
    };
};