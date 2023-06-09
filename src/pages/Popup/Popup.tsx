import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import './Popup.css';
import { showScanResults } from '../../scripts/page-context/lifecycle';
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

    await scanImagesAndInsertText({
      displayMode: app.displayMode,
      extractTextOptions: {
        psm: settings.pageSegmentationMode,
      },
    });

    setIsScanning(false);
    setAppState({
      ...app,
      scanState: {
        ...app.scanState,
        scanned: true,
      },
    });
  };

  const displayModeChange = (e: BaseSyntheticEvent) => {
    setAppState({
      ...app,
      displayMode: e.target.value,
    });
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

  return (
    <div className="App">
      <header className="App-header">
        <div className="Option">
          <label htmlFor="displayMode">Display Mode</label>
          <select
            name="displayMode"
            onChange={displayModeChange}
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
