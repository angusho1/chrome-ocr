import { PSM } from "tesseract.js";

// Reference: https://github.com/tesseract-ocr/tesseract/blob/4.0.0/src/ccstruct/publictypes.h#L163
export const PSM_MAP: PageSegmentationModeMap = {
    [PSM.OSD_ONLY]: {
        label: "OSD Only",
        description: "Orientation and script detection only"
    },
    [PSM.AUTO_OSD]: {
        label: "Auto OSD",
        description: "Automatic page segmentation with orientation and script detection"
    },
    [PSM.AUTO_ONLY]: {
        label: "Auto Only",
        description: "Automatic page segmentation, but no OSD, or OCR"
    },
    [PSM.AUTO]: {
        label: "Auto",
        description: "Fully automatic page segmentation, but no OSD"
    },
    [PSM.SINGLE_COLUMN]: {
        label: "Single Column",
        description: "Assume a single column of text of variable sizes"
    },
    [PSM.SINGLE_BLOCK_VERT_TEXT]: {
        label: "Single Block, Vertical Text",
        description: "Assume a single uniform block of vertically aligned text"
    },
    [PSM.SINGLE_BLOCK]: {
        label: "Single Block (Default)",
        description: "Assume a single uniform block of text"
    },
    [PSM.SINGLE_LINE]: {
        label: "Single Line",
        description: "Treat the image as a single text line"
    },
    [PSM.SINGLE_WORD]: {
        label: "Single Word",
        description: "Treat the image as a single word"
    },
    [PSM.CIRCLE_WORD]: {
        label: "Circle Word",
        description: "Treat the image as a single word in a circle"
    },
    [PSM.SINGLE_CHAR]: {
        label: "Single Character",
        description: "Treat the image as a single character"
    },
    [PSM.SPARSE_TEXT]: {
        label: "Sparse Text",
        description: "Find as much text as possible in no particular order"
    },
    [PSM.SPARSE_TEXT_OSD]: {
        label: "Sparse Text",
        description: "Sparse text with orientation and script detection"
    },
    [PSM.RAW_LINE]: {
        label: "Raw Line",
        description: "Treat the image as a single text line, bypassing hacks that are Tesseract-specific"
    }
};


type PageSegmentationModeMap = {
    [key in PSM]: {
        label: string,
        description: string,
    }
};