import React, { useEffect, useState } from 'react';
import './Popup.css';
import { showScanResults } from '../../scripts/page-context/lifecycle';
import { useExtensionState } from '../../hooks/extension-state.hooks';
import { ImageViewMode } from '../../types/state.types';
import { scanImagesAndInsertText } from '../../scripts/extension-context/scan-page';
import { setOnPageUnloadListener } from '../../scripts/extension-context/lifecycle';
import { executeScript } from '../../scripts/utils/execute-script';

const Popup = () => {
  const [isScanning, setIsScanning] = useState<boolean>();
  const { extensionState, setState: setScanned } = useExtensionState();

  const scanImages = async () => {
    if (extensionState.scanned) executeScript(showScanResults);
    setIsScanning(true);

    await scanImagesAndInsertText();

    setIsScanning(false);
    setScanned({ scanned: true, mode: ImageViewMode.SYMBOLS });
  };

  useEffect(() => {
    setOnPageUnloadListener();
  }, []);

  useEffect(() => {
    if (extensionState.mode === ImageViewMode.OFF && !extensionState.scanned) {
      scanImages();
    }
  }, [extensionState.mode, extensionState.scanned]);

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
