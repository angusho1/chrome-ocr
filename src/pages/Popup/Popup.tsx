import React, { useEffect, useState } from 'react';
import './Popup.css';
import { showScanResults } from '../../scripts/page-context/lifecycle';
import { useAppState } from '../../hooks/extension-state.hooks';
import { DisplayMode } from '../../types/state.types';
import { scanImagesAndInsertText } from '../../scripts/extension-context/scan-page';
import { setOnPageUnloadListener } from '../../scripts/extension-context/lifecycle';
import { executeScript } from '../../scripts/utils/execute-script';

const Popup = () => {
  const [isScanning, setIsScanning] = useState<boolean>();
  const { app, setAppState } = useAppState();

  const scanImages = async () => {
    if (app.scanState.scanned) executeScript(showScanResults);
    setIsScanning(true);

    await scanImagesAndInsertText();

    setIsScanning(false);
    setAppState({
      ...app,
      scanState: {
        ...app.scanState,
        scanned: true,
      },
      displayMode: DisplayMode.SYMBOLS,
    });
  };

  useEffect(() => {
    setOnPageUnloadListener();
  }, []);

  useEffect(() => {
    if (app.displayMode === DisplayMode.OFF && !app.scanState.scanned) {
      scanImages();
    }
  }, [app.displayMode, app.scanState.scanned]);

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
