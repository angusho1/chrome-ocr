import { executeScript } from "../utils/execute-script";

export const setOnPageUnloadListener = async () => {
    executeScript(addUnloadListener);
};

const addUnloadListener = () => {
    window.addEventListener('beforeunload', function() {
        chrome.storage.local.clear();
        chrome.runtime.sendMessage({ action: 'get_state' })
            .then(app => {
                chrome.runtime.sendMessage({
                    action: 'set_state',
                    data: {
                        ...app,
                        scanState: {
                            scanned: false,
                        }
                    },
                });
            });
    });
};