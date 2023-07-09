import { App, DisplayMode } from "../types/state.types";

export const DEFAULT_APP_STATE: App = {
    active: false,
    displayMode: DisplayMode.WORDS,
    scanState: {
        scanned: false,
    },
};