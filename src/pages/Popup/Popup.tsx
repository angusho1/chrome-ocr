import React, { useEffect, useState } from 'react';
import './Popup.css';
import { extractText, insertHtml, scanPage } from '../../scripts/images';
import { ChromeStorageKeys } from '../../constants/chrome-storage';
import { addUnloadListener } from '../../scripts/lifecycle';
import { useExtensionState } from '../../hooks/extension-state.hooks';
import { ImageViewMode } from '../../types/state.types';

const Popup = () => {
  const [isScanning, setIsScanning] = useState<boolean>();
  const { extensionState, setScanned } = useExtensionState();

  const scanImages = async () => {
    setIsScanning(true);
    const [tab] = await chrome.tabs.query({ active: true });
    const scriptTargetOptions = {
      tabId: tab.id as number,
      allFrames: true
    };

    const injectionResults = await chrome.scripting.executeScript({
      target: scriptTargetOptions,
      func: scanPage,
    });

    if (!injectionResults || !injectionResults.length) {
      console.log('No images found');
      return;
    }
    console.log('Image srcs', injectionResults);

    const imageScanData = (await chrome.storage.local.get([ChromeStorageKeys.IMAGE_DATA_KEY]))[ChromeStorageKeys.IMAGE_DATA_KEY] || {};

    const jobs: Promise<void>[] = [];
    injectionResults.forEach(async (frame) => {
      frame.result.imgSrcs.forEach(async (imgSrc) => {
        const job = (async () => {
          let symbols;
          if (!imageScanData[imgSrc]) {
            const res = await extractText(imgSrc);
            symbols = res.symbols
              .filter(symbol => symbol.confidence > 95)
              .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));
  
              imageScanData[imgSrc] = symbols;
          } else {
            console.log('exists already');
            symbols = imageScanData[imgSrc];
          }
  
          await chrome.scripting.executeScript({
            target: scriptTargetOptions,
            func: insertHtml,
            args: [imgSrc, symbols]
          });
        })();
        jobs.push(job);
      });
    });

    await Promise.all(jobs);
    await chrome.storage.local.set({ [ChromeStorageKeys.IMAGE_DATA_KEY]: imageScanData });
    setIsScanning(false);
    setScanned();
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
    if (extensionState.mode === ImageViewMode.SYMBOLS) {
      scanImages();
    }
  }, [extensionState.mode]);

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
