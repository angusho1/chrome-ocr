import { executeScript } from "../utils/execute-script";

export const setOnPageUnloadListener = async () => {
    executeScript(addUnloadListener);
};

const addUnloadListener = () => {
    window.addEventListener('beforeunload', function() {
        chrome.storage.local.clear();
        chrome.runtime.sendMessage({ action: 'get_app_state' })
            .then(app => {
                chrome.runtime.sendMessage({
                    action: 'set_app_state',
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