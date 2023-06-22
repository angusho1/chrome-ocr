import { useEffect, useState } from "react";
import { ExtensionSettings } from "../types/state.types";
import { GetStateActions, PublishMessageActions, SetStateActions } from "../constants/messaging.const";
import { PSM } from "tesseract.js";

export type UseExtensionSettingsResult = {
    settings: ExtensionSettings;
    setSettings: (settings: ExtensionSettings) => void;
}

const INTIAL_SETTINGS: ExtensionSettings = {
    scanOnOpen: false,
    pageSegmentationMode: PSM.AUTO_OSD,
}

export const useExtensionSettings = (): UseExtensionSettingsResult => {
    const [settings, setSettings] = useState<ExtensionSettings>(INTIAL_SETTINGS);

    const getSettings = async (): Promise<ExtensionSettings> => {
        return await chrome.runtime.sendMessage({ action: GetStateActions.GET_SETTINGS });
    };

    const setExtensionSettings = (settings: ExtensionSettings) => {
        chrome.runtime.sendMessage({ action: SetStateActions.SET_SETTINGS, data: settings });
    };

    useEffect(() => {
        getSettings()
            .then(res => setSettings(res));
        chrome.runtime.onMessage.addListener(function(message) {
            if (message.action === PublishMessageActions.PUBLISH_SETTINGS) {
                setSettings(message.data);
            }
        });
    }, []);

    return {
        settings,
        setSettings: setExtensionSettings,
    };
};