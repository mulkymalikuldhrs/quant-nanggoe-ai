
import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface TabbedWidgetProps {
  tabs: Tab[];
  initialTabId?: string;
  className?: string;
  isDragMode?: boolean;
  dragHandle?: React.ReactNode;
}

const TabbedWidget: React.FC<TabbedWidgetProps> = ({ tabs, initialTabId, className, isDragMode, dragHandle }) => {
  const [activeTab, setActiveTab] = useState(initialTabId || tabs[0]?.id);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTabDetails = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`widget-container flex flex-col min-h-0 h-full ${className}`}>
      <div className="flex-shrink-0 flex items-center justify-between p-1 border-b border-white/10">
        <div className="flex items-center gap-1 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-yellow-500/20 text-yellow-200'
                  : 'text-gray-400 hover:bg-white/10'
              }`}
              aria-current={activeTab === tab.id}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {isDragMode && dragHandle}
      </div>
      <div className="flex-grow min-h-0 overflow-y-auto">
        {activeTabDetails?.content}
      </div>
    </div>
  );
};

export default TabbedWidget;
