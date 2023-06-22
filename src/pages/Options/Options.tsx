import React, { BaseSyntheticEvent } from 'react';
import './Options.css';
import { useExtensionSettings } from '../../hooks/extension-settings.hooks';
import { PSM_MAP } from '../../constants/tesseract.const';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  const { settings, setSettings } = useExtensionSettings();

  const scanOnOpenChange = (e: BaseSyntheticEvent) => {
    setSettings({
      ...settings,
      scanOnOpen: e.target.checked,
    });
  };

  const pageSegmentationModeChange = (e: BaseSyntheticEvent) => {
    setSettings({
      ...settings,
      pageSegmentationMode: e.target.value,
    });
  };

  return (
    <div className="Container">
      <div>
        <h1>{title} Page</h1>
      </div>
      <div className="OptionsContainer">
        <div className="Option">
          <label htmlFor="scanOnOpen">
            Scan images automatically when popup is opened
          </label>
          <input
            id="scanOnOpen"
            name="scanOnOpen"
            type="checkbox"
            checked={settings.scanOnOpen}
            onChange={scanOnOpenChange}
          />
        </div>
        <div className="Option">
          <label htmlFor="pageSegmentationMode">Page Segmentation Mode</label>
          <select
            name="pageSegmentationMode"
            onChange={pageSegmentationModeChange}
            value={settings.pageSegmentationMode}
          >
            { Object.entries(PSM_MAP).map(([val, data]) => (
              <option key={val} value={val}>{data.label} - {data.description}</option>
            )) }
          </select>
        </div>
      </div>
    </div>
  );
};

export default Options;
