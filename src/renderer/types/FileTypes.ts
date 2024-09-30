export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}