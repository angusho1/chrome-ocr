import React, { useEffect, useState } from 'react';
import './Popup.css';
import { extractText, getImageSrcsFromPage, insertHtml } from '../../scripts/images';
import { ChromeStorageKeys } from '../../constants/chrome-storage';
import { addUnloadListener, showScanResults } from '../../scripts/lifecycle';
import { useExtensionState } from '../../hooks/extension-state.hooks';
import { ImageViewMode } from '../../types/state.types';
import { executeScript } from '../Background';

const Popup = () => {
  const [isScanning, setIsScanning] = useState<boolean>();
  const { extensionState, setState: setScanned } = useExtensionState();

  const scanImages = async () => {
    if (extensionState.scanned) executeScript(showScanResults);
    setIsScanning(true);

    const [tab] = await chrome.tabs.query({ active: true });

    const imageSrcs = await getImageSrcsFromPage(tab);

    const imageScanData = (await chrome.storage.local.get([ChromeStorageKeys.IMAGE_DATA_KEY]))[ChromeStorageKeys.IMAGE_DATA_KEY] || {};

    const jobs: Promise<void>[] = [];
    imageSrcs.forEach(async (imgSrc) => {
      const job = (async () => {
        let symbols;
        if (!imageScanData[imgSrc]) {
          const res = await extractText(imgSrc);
          symbols = res.symbols
            .filter(symbol => symbol.confidence > 95)
            .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));

          imageScanData[imgSrc] = symbols;
        } else {
          symbols = imageScanData[imgSrc];
        }

        await chrome.scripting.executeScript({
          target: {
            tabId: tab.id as number,
            allFrames: true
          },
          func: insertHtml,
          args: [imgSrc, symbols]
        });
      })();
      jobs.push(job);
    });

    await Promise.all(jobs);
    await chrome.storage.local.set({ [ChromeStorageKeys.IMAGE_DATA_KEY]: imageScanData });
    setIsScanning(false);
    setScanned({ scanned: true, mode: ImageViewMode.SYMBOLS });
  };

  const setOnPageUnloadListener = async () => {
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: {
        tabId: tab.id as number,
        allFrames: true
      },
      func: addUnloadListener,
    });
  };

  useEffect(() => {
    setOnPageUnloadListener();
  }, []);

  useEffect(() => {
    if (extensionState.mode === ImageViewMode.OFF && !extensionState.scanned) {
      scanImages();
    }
  }, [extensionState]);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          { isScanning ? 'Scanning Images...' : null }
        </div>
        { !isScanning && (
          <button onClick={scanImages}>Scan Images</button>
        )}
      </header>
    </div>
  );
};

export default Popup;
