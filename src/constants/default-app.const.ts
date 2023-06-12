import { App, DisplayMode } from "../types/state.types";

export const DEFAULT_APP_STATE: App = {
    displayMode: DisplayMode.OFF,
    scanState: {
        scanned: false,
    },
};