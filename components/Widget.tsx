import React from 'react';

interface WidgetProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  dragHandle?: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ title, icon, children, className, contentClassName, dragHandle }) => {
  return (
    <div className={`widget-container flex flex-col min-h-0 h-full ${className}`}>
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          <h3 className="font-semibold text-[var(--color-text-secondary)] text-xs tracking-wider uppercase">{title}</h3>
        </div>
         {dragHandle}
      </div>
      <div className={`p-2 flex-grow min-h-0 overflow-hidden ${contentClassName || ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Widget;