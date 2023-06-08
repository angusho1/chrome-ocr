export const setOnPageUnloadListener = async () => {
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
        target: {
            tabId: tab.id as number,
            allFrames: true
        },
        func: addUnloadListener,
    });
};

const addUnloadListener = () => {
    window.addEventListener('beforeunload', function() {
        chrome.storage.local.clear();
    });
};