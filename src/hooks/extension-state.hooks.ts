import { useEffect, useState } from "react";
import { App } from "../types/state.types";
import { GetStateActions, PublishMessageActions, SetStateActions } from "../constants/messaging.const";
import { DEFAULT_APP_STATE } from "../constants/default-app.const";

export type AppStateResult = {
    app: App;
    setAppState: (state: App) => void;
}

export const useAppState = (): AppStateResult => {
    const [state, setState] = useState<App | undefined>(undefined);

    const setAppState = (state: App) => {
        chrome.runtime.sendMessage({ action: SetStateActions.SET_STATE, data: state });
    };

    useEffect(() => {
        chrome.runtime.onMessage.addListener(function(message) {
            if (message.action === PublishMessageActions.PUBLISH_STATE) {
                setState(message.data);
            }
        });
    }, []);

    useEffect(() => {
        if (!state) {
            chrome.runtime.sendMessage({ action: GetStateActions.GET_STATE })
                .then(state => setState(state));
        }
    }, [state]);

    return {
        app: state || DEFAULT_APP_STATE,
        setAppState,
    };
};