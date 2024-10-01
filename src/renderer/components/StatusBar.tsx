import React, { useState, useEffect } from 'react';
import { extensionService, StatusBarItem } from '../../services/ExtensionService';
import './StatusBar.css';

const StatusBar: React.FC = () => {
  const [statusBarItems, setStatusBarItems] = useState<StatusBarItem[]>([]);

  useEffect(() => {
    const updateStatusBarItems = () => {
      const items = extensionService.getStatusBarItems();
      setStatusBarItems(items.sort((a, b) => (b.priority || 0) - (a.priority || 0)));
    };

    updateStatusBarItems();

    // In a real implementation, we would set up a listener for changes to status bar items
    // For now, we'll just update every 5 seconds as an example
    const intervalId = setInterval(updateStatusBarItems, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleItemClick = (item: StatusBarItem) => {
    if (item.command) {
      extensionService.executeCommand(item.command);
    }
  };

  return (
    <div className="status-bar">
      {statusBarItems.map((item) => (
        <div
          key={item.id}
          className="status-bar-item"
          onClick={() => handleItemClick(item)}
          title={item.tooltip}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default StatusBar;