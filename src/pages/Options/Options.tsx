import React, { BaseSyntheticEvent } from 'react';
import './Options.css';
import { useExtensionSettings } from '../../hooks/extension-settings.hooks';

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

  return (
    <div className="Container">
      <div>
        <h1>{title} Page</h1>
      </div>
      <div className="OptionsContainer">
        <span>
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
        </span>
      </div>
    </div>
  );
};

export default Options;
