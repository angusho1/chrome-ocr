export const addUnloadListener = () => {
    window.addEventListener('beforeunload', function() {
        chrome.storage.local.clear();
    });
};

export const hideScanResults = () => {
    const wrapperDivs = Array.from(document.getElementsByClassName('ocr-overlay-wrapper'));

    wrapperDivs.forEach(div => {
        (div as HTMLElement).style.display = 'none';
    });
};