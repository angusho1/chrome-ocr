export const addUnloadListener = () => {
    window.addEventListener('beforeunload', function() {
        chrome.storage.local.clear();
    });
};