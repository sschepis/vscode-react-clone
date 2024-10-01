import React, { useState, useEffect } from 'react';
import { extensionService } from '../../services/ExtensionService';
import './CommandPalette.css';

interface CommandPaletteProps {
  isVisible: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isVisible, onClose }) => {
  const [commands, setCommands] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setCommands(extensionService.getRegisteredCommands());
  }, []);

  const filteredCommands = commands.filter(cmd =>
    cmd.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCommandClick = (command: string) => {
    extensionService.executeCommand(command);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="command-palette">
      <input
        type="text"
        placeholder="Type a command..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        autoFocus
      />
      <ul>
        {filteredCommands.map((cmd) => (
          <li key={cmd} onClick={() => handleCommandClick(cmd)}>
            {cmd}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommandPalette;