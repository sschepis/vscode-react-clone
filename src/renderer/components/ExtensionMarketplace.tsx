import React, { useState, useEffect } from 'react';
import { extensionManagerService, ExtensionInfo } from '../../services/ExtensionManagerService';
import ExtensionSettings from './ExtensionSettings';
import './ExtensionMarketplace.css';

interface ExtensionWithStatus extends ExtensionInfo {
  status: 'available' | 'installing' | 'installed' | 'uninstalling' | 'error';
  errorMessage?: string;
}

const ExtensionMarketplace: React.FC = () => {
  const [extensions, setExtensions] = useState<ExtensionWithStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);

  useEffect(() => {
    fetchExtensions();
  }, []);

  const fetchExtensions = async () => {
    setIsLoading(true);
    try {
      const availableExtensions = await extensionManagerService.fetchAvailableExtensions();
      const extensionsWithStatus: ExtensionWithStatus[] = availableExtensions.map(ext => ({
        ...ext,
        status: extensionManagerService.isExtensionInstalled(ext.id) ? 'installed' : 'available'
      }));
      setExtensions(extensionsWithStatus);
    } catch (error) {
      console.error('Failed to fetch extensions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async (extension: ExtensionWithStatus) => {
    setExtensions(prev => prev.map(ext => 
      ext.id === extension.id ? { ...ext, status: 'installing' } : ext
    ));

    try {
      await extensionManagerService.installExtension(extension);
      setExtensions(prev => prev.map(ext => 
        ext.id === extension.id ? { ...ext, status: 'installed' } : ext
      ));
    } catch (error) {
      console.error(`Failed to install extension ${extension.name}:`, error);
      setExtensions(prev => prev.map(ext => 
        ext.id === extension.id ? { ...ext, status: 'error', errorMessage: 'Installation failed' } : ext
      ));
    }
  };

  const handleUninstall = async (extension: ExtensionWithStatus) => {
    setExtensions(prev => prev.map(ext => 
      ext.id === extension.id ? { ...ext, status: 'uninstalling' } : ext
    ));

    try {
      await extensionManagerService.uninstallExtension(extension.id);
      setExtensions(prev => prev.map(ext => 
        ext.id === extension.id ? { ...ext, status: 'available' } : ext
      ));
      setSelectedExtension(null);
    } catch (error) {
      console.error(`Failed to uninstall extension ${extension.name}:`, error);
      setExtensions(prev => prev.map(ext => 
        ext.id === extension.id ? { ...ext, status: 'error', errorMessage: 'Uninstallation failed' } : ext
      ));
    }
  };

  const toggleSettings = (extensionId: string) => {
    setSelectedExtension(prevId => prevId === extensionId ? null : extensionId);
  };

  const filteredExtensions = extensions.filter(extension =>
    extension.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    extension.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="extension-marketplace">
      <h2>Extension Marketplace</h2>
      <input
        type="text"
        placeholder="Search extensions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {isLoading ? (
        <p>Loading extensions...</p>
      ) : (
        <ul className="extension-list">
          {filteredExtensions.map(extension => (
            <li key={extension.id} className="extension-item">
              <h3>{extension.name} v{extension.version}</h3>
              <p>{extension.description}</p>
              {extension.status === 'installed' && (
                <>
                  <button onClick={() => handleUninstall(extension)} className="uninstall-button">Uninstall</button>
                  <button onClick={() => toggleSettings(extension.id)} className="settings-button">
                    {selectedExtension === extension.id ? 'Hide Settings' : 'Show Settings'}
                  </button>
                </>
              )}
              {extension.status === 'available' && (
                <button onClick={() => handleInstall(extension)} className="install-button">Install</button>
              )}
              {extension.status === 'installing' && (
                <button disabled className="installing-button">Installing...</button>
              )}
              {extension.status === 'uninstalling' && (
                <button disabled className="uninstalling-button">Uninstalling...</button>
              )}
              {extension.status === 'error' && (
                <div>
                  <button onClick={() => handleInstall(extension)} className="retry-button">Retry</button>
                  <span className="error-message">{extension.errorMessage}</span>
                </div>
              )}
              {selectedExtension === extension.id && (
                <ExtensionSettings extensionId={extension.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExtensionMarketplace;