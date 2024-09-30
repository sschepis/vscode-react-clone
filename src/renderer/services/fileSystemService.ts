import { ipcRenderer } from 'electron';
import { FileNode } from '../types/FileTypes';

class FileSystemService {
  async readDirectory(path: string): Promise<FileNode[]> {
    return ipcRenderer.invoke('read-directory', path);
  }

  async readFile(path: string): Promise<string> {
    return ipcRenderer.invoke('read-file', path);
  }

  async writeFile(path: string, content: string): Promise<void> {
    return ipcRenderer.invoke('write-file', path, content);
  }

  async createDirectory(path: string): Promise<void> {
    return ipcRenderer.invoke('create-directory', path);
  }

  async deleteFile(path: string): Promise<void> {
    return ipcRenderer.invoke('delete-file', path);
  }

  async deleteDirectory(path: string): Promise<void> {
    return ipcRenderer.invoke('delete-directory', path);
  }
}

export const fileSystemService = new FileSystemService();