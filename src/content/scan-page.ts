import { ScanPageResult } from "../types/script.types";

export const queryPageForImages = (): ScanPageResult => {
    const images = Array.from(document.querySelectorAll('img'));
    return {
        imgSrcs: images.map(img => img.src),
    };
};
