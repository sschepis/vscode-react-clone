import * as React from 'react';
import './TabBar.css';

interface Tab {
  id: string;
  name: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabClick, onTabClose }) => {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="tab-name">{tab.name}</span>
          <button className="tab-close" onClick={(e) => {
            e.stopPropagation();
            onTabClose(tab.id);
          }}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};