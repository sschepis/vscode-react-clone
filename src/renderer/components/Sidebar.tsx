import * as React from 'react';
import { FileExplorer } from './FileExplorer';
import { FileNode } from '../types/FileTypes';

interface SidebarProps {
  files: FileNode[];
  isVisible: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ files, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="Sidebar">
      <FileExplorer files={files} />
    </div>
  );
};