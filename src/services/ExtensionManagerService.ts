import { ExtensionManifest, extensionService } from './ExtensionService';
import { extensionLoaderService } from './ExtensionLoaderService';

export interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  downloadUrl: string;
}

class ExtensionManagerService {
  private installedExtensions: Map<string, ExtensionManifest> = new Map();

  async fetchAvailableExtensions(): Promise<ExtensionInfo[]> {
    // In a real implementation, this would fetch from an API
    return [
      {
        id: 'ext1',
        name: 'Sample Extension 1',
        version: '1.0.0',
        description: 'A sample extension',
        downloadUrl: 'https://example.com/ext1.js',
      },
      {
        id: 'ext2',
        name: 'Sample Extension 2',
        version: '1.1.0',
        description: 'Another sample extension',
        downloadUrl: 'https://example.com/ext2.js',
      },
    ];
  }

  async installExtension(extensionInfo: ExtensionInfo): Promise<void> {
    try {
      await extensionLoaderService.installAndLoadExtension(extensionInfo.downloadUrl, extensionInfo.id);
      
      const manifest: ExtensionManifest = {
        id: extensionInfo.id,
        name: extensionInfo.name,
        version: extensionInfo.version,
        description: extensionInfo.description,
        main: `${extensionInfo.id}.js`,
        activationEvents: ['*'],
        dependencies: [],
        contributes: {},
      };

      this.installedExtensions.set(extensionInfo.id, manifest);
      
      // Activate the extension
      await extensionService.activateExtension(extensionInfo.id);
    } catch (error) {
      console.error(`Failed to install extension ${extensionInfo.name}:`, error);
      throw error;
    }
  }

  async uninstallExtension(extensionId: string): Promise<void> {
    try {
      // Deactivate the extension
      await extensionService.deactivateExtension(extensionId);

      // Remove the extension from the installed list
      this.installedExtensions.delete(extensionId);

      // In a real implementation, you would also delete the extension files
      console.log(`Extension ${extensionId} uninstalled successfully`);
    } catch (error) {
      console.error(`Failed to uninstall extension ${extensionId}:`, error);
      throw error;
    }
  }

  getInstalledExtensions(): ExtensionManifest[] {
    return Array.from(this.installedExtensions.values());
  }

  isExtensionInstalled(extensionId: string): boolean {
    return this.installedExtensions.has(extensionId);
  }
}

export const extensionManagerService = new ExtensionManagerService();