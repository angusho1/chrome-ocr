import { ImageAttributes, Snippet } from "../types/script.types";

export const insertSnippets = (imgSrc: string, snippets: Snippet[]) => {
    const disableUserInteraction = (imgNode: HTMLImageElement) => {
        const imgAttributes: ImageAttributes = {};

        if (imgNode.draggable) {
            imgNode.ondragstart = (e) => e.preventDefault();
            imgNode.draggable = false;
            imgAttributes.draggable = true;
        }

        if (imgNode.style.touchAction !== 'none') {
            imgAttributes.touchAction = imgNode.style.touchAction;
            imgNode.onclick = (e) => e.preventDefault();
            imgNode.addEventListener('click', function(event) {
                event.preventDefault();
            }, { passive: false });
            imgNode.style.touchAction = 'none';
        }

        if (imgNode.style.pointerEvents !== 'none') {
            imgAttributes.pointerEvents = imgNode.style.pointerEvents;
            imgNode.style.pointerEvents = 'none';
        }
    
        chrome.runtime.sendMessage({ action: 'set_image_attributes', data: {
            imgSrc,
            attributes: imgAttributes,
        } });
    };

    const insertWrapperParent = (imgNode: HTMLImageElement) => {
        const existingParent = imgNode.parentNode;
        const wrapper = document.createElement('div');
        wrapper.style.cssText = imgNode.style.cssText;
        wrapper.style.position = 'relative';
        existingParent?.replaceChild(wrapper, imgNode);
        wrapper.appendChild(imgNode);

        return wrapper;
    };

    const imgNode = Array.from(document.querySelectorAll('img')).find(img => img.src === imgSrc);
    if (imgNode) {
        disableUserInteraction(imgNode);
        const imageWrapper = insertWrapperParent(imgNode);

        const widthScale = imgNode.width / imgNode.naturalWidth;
        const heightScale = imgNode.height / imgNode.naturalHeight;

        const textWrapper = document.createElement('div');
        textWrapper.className = 'ocr-overlay-wrapper';
        
        snippets.forEach((snippet, index) => {
            const bbox = snippet.bbox;
            const div = document.createElement('div');
            const scaledBboxHeight = (bbox.y1 - bbox.y0) * heightScale;

            div.style.border = '1px solid red';
            div.style.position = 'absolute';
            div.style.left = `${window.scrollX + (bbox.x0 * widthScale)}px`;
            div.style.top = `${window.scrollY + (bbox.y0 * heightScale)}px`;
            div.style.width = `${(bbox.x1 - bbox.x0) * widthScale}px`;
            div.style.height = `${scaledBboxHeight}px`;
            
            div.innerText = snippet.text;
            div.style.color = 'rgba(0, 0, 0, 0)';
            div.style.fontSize = `${scaledBboxHeight}px`;

            const before = document.createElement('div');
            before.style.content = '""';
            before.style.position = 'absolute';
            before.style.top = '-5px';
            before.style.left = '-5px';
            before.style.width = 'calc(100% + 10px)';
            before.style.height = 'calc(100% + 10px)';
            before.style.zIndex = '-1';
            before.style.backgroundColor = 'transparent';
            before.style.pointerEvents = 'none';
            div.appendChild(before);

            const after = document.createElement('div');
            after.style.content = '""';
            after.style.position = 'absolute';
            after.style.bottom = '-5px';
            after.style.right = '-5px';
            after.style.width = 'calc(100% + 10px)';
            after.style.height = 'calc(100% + 10px)';
            after.style.zIndex = '-1';
            after.style.backgroundColor = 'transparent';
            after.style.pointerEvents = 'none';
            div.appendChild(after);

            textWrapper.appendChild(div);
        });

        imageWrapper.appendChild(textWrapper);
    }
};

export const showScanResults = () => {
    const wrapperDivs = Array.from(document.getElementsByClassName('ocr-overlay-wrapper'));

    wrapperDivs.forEach(div => {
        (div as HTMLElement).style.display = 'block';
    });
};

/**
 * Remove all existing snippets in the DOM
 */
export const clearSnippets = () => {
    const wrapperDivs = Array.from(document.getElementsByClassName('ocr-overlay-wrapper'));

    wrapperDivs.forEach(div => {
        (div as HTMLElement).innerHTML = '';
    });
};

export const removeSnippets = () => {    
    const images = Array.from(document.querySelectorAll('img'));

    chrome.runtime.sendMessage({ action: 'get_image_attributes' })
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
    
    const wrapperDivs = Array.from(document.getElementsByClassName('ocr-overlay-wrapper'));

    wrapperDivs.forEach(div => {
        (div as HTMLElement).remove();
    });
};
