import { PSM } from "tesseract.js";
import { ExtensionSettings } from "../types/state.types";

export const DEFAULT_EXTENSION_SETTINGS: ExtensionSettings = {
    scanOnOpen: true,
    pageSegmentationMode: PSM.AUTO_OSD,
};