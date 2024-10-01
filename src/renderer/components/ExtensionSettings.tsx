import React, { useState, useEffect } from 'react';
import { extensionService } from '../../services/ExtensionService';
import './ExtensionSettings.css';

interface ExtensionSettingsProps {
  extensionId: string;
}

interface Setting {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
  description: string;
}

const ExtensionSettings: React.FC<ExtensionSettingsProps> = ({ extensionId }) => {
  const [settings, setSettings] = useState<Setting[]>([]);

  useEffect(() => {
    const extensionConfig = extensionService.getConfiguration(extensionId);
    const settingsArray: Setting[] = Object.entries(extensionConfig).map(([key, value]) => ({
      key,
      value: value as string | number | boolean,
      type: typeof value as 'string' | 'number' | 'boolean',
      description: 'Description not available', // In a real implementation, this would come from the extension's manifest
    }));
    setSettings(settingsArray);
  }, [extensionId]);

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    const updatedSettings = settings.map(setting =>
      setting.key === key ? { ...setting, value } : setting
    );
    setSettings(updatedSettings);
    
    const updatedConfig = updatedSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    
    extensionService.setConfiguration(extensionId, updatedConfig);
  };

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'string':
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value as number}
            onChange={(e) => handleSettingChange(setting.key, Number(e.target.value))}
          />
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={setting.value as boolean}
            onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="extension-settings">
      <h2>Settings for {extensionId}</h2>
      {settings.map((setting) => (
        <div key={setting.key} className="setting-item">
          <label htmlFor={setting.key}>{setting.key}</label>
          {renderSettingInput(setting)}
          <p className="setting-description">{setting.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ExtensionSettings;