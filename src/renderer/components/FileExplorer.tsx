import * as React from 'react';
import { commandsService } from '../services/commandsService';
import { createOpenFileCommand } from '../commands/workbenchCommands';
import { FileNode } from '../types/FileTypes';
import './FileExplorer.css';

interface FileExplorerProps {
  files: FileNode[];
}

interface FileTreeNodeProps {
  node: FileNode;
  path: string;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, path }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpand = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClick = () => {
    if (node.type === 'file') {
      commandsService.executeCommand(createOpenFileCommand(`${path}/${node.name}`));
    } else {
      toggleExpand();
    }
  };

  return (
    <div className="file-node">
      <div className="file-node-content" onClick={handleClick}>
        {node.type === 'directory' && (
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        )}
        <span className={`file-icon ${node.type}`}></span>
        <span className="file-name">{node.name}</span>
      </div>
      {node.type === 'directory' && isExpanded && node.children && (
        <div className="file-children">
          {node.children.map((child, index) => (
            <FileTreeNode key={index} node={child} path={`${path}/${node.name}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ files }) => {
  return (
    <div className="file-explorer">
      <h3>File Explorer</h3>
      {files.map((file, index) => (
        <FileTreeNode key={index} node={file} path="" />
      ))}
    </div>
  );
};