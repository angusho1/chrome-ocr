import { DEFAULT_APP_STATE } from "../../constants/default-app.const";
import { App } from "../../types/state.types";

let app: App = DEFAULT_APP_STATE;

/**
 * Should only be called from the background
 */
export const setAppState = (newAppState: App) => app = newAppState;

/**
 * Should only be called from the background
 */
export const getAppState = () => app;
