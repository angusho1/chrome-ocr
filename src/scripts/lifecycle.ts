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
};