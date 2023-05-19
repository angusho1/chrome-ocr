import React, { useEffect, useState } from 'react';
import './Popup.css';
import { extractText, insertHtml, scanPage } from '../../scripts/images';

const Popup = () => {
  const [isScanning, setIsScanning] = useState<boolean>();

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

    injectionResults.forEach(frame => {
      frame.result.imgSrcs.forEach(imgSrc => {
        extractText(imgSrc)
          .then(res => {
            console.log(res.symbols);
            const symbols = res.symbols
              .filter(symbol => symbol.confidence > 95)
              .map(symbol => ({ bbox: symbol.bbox, text: symbol.text }));

            chrome.scripting.executeScript({
              target: scriptTargetOptions,
              func: insertHtml,
              args: [imgSrc, symbols]
            });
          })
          .then(() => setIsScanning(false))
      });
    });
  };

  useEffect(() => {
    scanImages();
  }, []);

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
