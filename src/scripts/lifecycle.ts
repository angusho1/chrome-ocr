import { ImageAttributes } from "../types/script.types";

export const addUnloadListener = () => {
    window.addEventListener('beforeunload', function() {
        chrome.storage.local.clear();
    });
};

export const showScanResults = () => {
    const wrapperDivs = Array.from(document.getElementsByClassName('ocr-overlay-wrapper'));

    wrapperDivs.forEach(div => {
        (div as HTMLElement).style.display = 'block';
    });
};

export const hideScanResults = () => {    
    const wrapperDivs = Array.from(document.getElementsByClassName('ocr-overlay-wrapper'));

    wrapperDivs.forEach(div => {
        (div as HTMLElement).style.display = 'none';
    });

    const images = Array.from(document.querySelectorAll('img'));

    chrome.runtime.sendMessage({ action: 'GET_IMAGE_ATTRS' })
        .then(interactionAttributes => {
            console.log('interactionAttributes', interactionAttributes);
            images.forEach((image) => {
                const attributes: ImageAttributes = interactionAttributes[image.src];

                if (!attributes) {
                    console.log(`No attributes for ${image.src}`);
                    return;
                }

                if (attributes.draggable) {
                    image.draggable = true;
                    image.ondragstart = (e) => {
                        e.dataTransfer!.setDragImage(image, 0, 0);
                    };
                }

                if (attributes.touchAction) {
                    image.onclick = null;
                    image.removeEventListener('click', function(event) {
                        event.preventDefault();
                    });
                    image.style.touchAction = attributes.touchAction;
                }

                if (attributes.pointerEvents) {
                    image.style.pointerEvents = attributes.pointerEvents;
                }
            });
        });
};