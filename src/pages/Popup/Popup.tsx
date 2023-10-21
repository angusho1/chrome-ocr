import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import './Popup.css';
import { showScanResults } from '../../scripts/page-context/text-display';
import { useAppState } from '../../hooks/app-state.hooks';
import { DisplayMode } from '../../types/state.types';
import { scanImagesAndInsertText } from '../../scripts/extension-context/scan-page';
import { setOnPageUnloadListener } from '../../scripts/extension-context/lifecycle';
import { executeScript } from '../../scripts/utils/execute-script';
import { useExtensionSettings } from '../../hooks/extension-settings.hooks';

const Popup = () => {
  const [isScanning, setIsScanning] = useState<boolean>();
  const { app, setAppState } = useAppState();
  const { settings } = useExtensionSettings();

  const scanImages = async () => {
    if (app.scanState.scanned) executeScript(showScanResults);
    setIsScanning(true);

    // TODO: tesseract worker doesn't work in the background, so we're calling it from the popup instead
    await scanImagesAndInsertText({
      displayMode: app.displayMode,
      extractTextOptions: {
        psm: settings.pageSegmentationMode,
      },
    });

    setIsScanning(false);
    setAppState({
      ...app,
      active: true,
      scanState: {
        ...app.scanState,
        scanned: true,
      },
    });
  };

  const onDisplayModeSelect = (e: BaseSyntheticEvent) => {
    setAppState({
      ...app,
      displayMode: e.target.value,
    });
  };

  const displayModeChange = () => {
    if (app.active && app.scanState.scanned) {
      executeScript(showScanResults);
    }
  };

  const shouldScan = !app.active 
                      && !app.scanState.scanned 
                      && settings.scanOnOpen;

  useEffect(() => {
    setOnPageUnloadListener();
  }, []);

  useEffect(() => {
    if (shouldScan) {
      scanImages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldScan]);

  useEffect(() => {
    displayModeChange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.displayMode]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="Option">
          <label htmlFor="displayMode">Display Mode</label>
          <select
            name="displayMode"
            onChange={onDisplayModeSelect}
            value={app.displayMode}
          >
            { Object.values(DisplayMode).map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            )) }
          </select>
        </div>
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
