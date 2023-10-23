export const executeScript = async (func: (...args: any[]) => void, args?: any[]) => {
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
        target: {
            tabId: tab.id as number,
            allFrames: true
        },
        func,
        ...{ args: args || undefined }
    });
};

export const pageConsoleLog = (...args: any[]) => executeScript((d: any) => console.log(...d), [args]);