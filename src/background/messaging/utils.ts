export const sendMessage = (action: string, data: any) => {
    chrome.runtime.sendMessage({ action, data });
};