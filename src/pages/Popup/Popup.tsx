import React from 'react';
import './Popup.css';
import { getImages, onImageSrcsRetrieved } from '../../scripts/images';

const Popup = () => {
  const scanImages = () => {
    chrome.tabs.query({ active: true }, (tabs) => {
      const tab = tabs[0];
      chrome.scripting.executeScript({
        target: {
          tabId: tab.id as number,
          allFrames: true
        },
        func: getImages,
      }, onImageSrcsRetrieved);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={scanImages}>Scan Images</button>
      </header>
    </div>
  );
};

export default Popup;
