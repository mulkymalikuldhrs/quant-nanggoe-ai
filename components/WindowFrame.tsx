import React, { useState, useRef, useEffect } from 'react';

interface WindowFrameProps {
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isActive: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const WindowFrame: React.FC<WindowFrameProps> = ({
  title,
  isOpen,
  isMinimized,
  isActive,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 700, height: 500 },
  icon,
  children
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxSize, setPreMaxSize] = useState(defaultSize);
  const [preMaxPos, setPreMaxPos] = useState(defaultPosition);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Responsive: Check viewport on mount/resize
  useEffect(() => {
    const handleResize = () => {
        // Ensure window doesn't get lost off-screen on resize
        if (window.innerWidth < 768) {
             // Mobile safeguard
             if (size.width > window.innerWidth) setSize(prev => ({ ...prev, width: window.innerWidth - 20 }));
             if (position.x < 0) setPosition(prev => ({ ...prev, x: 0 }));
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size, position]);

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    onFocus();
    if (windowRef.current) {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const toggleMaximize = () => {
      onFocus();
      if (isMaximized) {
          setSize(preMaxSize);
          setPosition(preMaxPos);
      } else {
          setPreMaxSize(size);
          setPreMaxPos(position);
          setPosition({ x: 0, y: 32 }); // Start below Top Bar
          setSize({ width: window.innerWidth, height: window.innerHeight - 110 }); // Account for Dock and Bar
      }
      setIsMaximized(!isMaximized);
  };

  if (!isOpen || isMinimized) return null;

  return (
    <div 
        ref={windowRef}
        className="fixed flex flex-col rounded-xl overflow-hidden glass-panel transition-all duration-200"
        style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            zIndex: zIndex,
            // Mobile safeguards inline style
            maxWidth: '100vw',
            maxHeight: 'calc(100vh - 80px)', // Leave room for dock
            transform: isActive ? 'scale(1.002)' : 'scale(1)',
            opacity: isActive ? 1 : 0.95,
            boxShadow: isActive ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
        onMouseDown={onFocus}
    >
        {/* macOS Header Bar */}
        <div 
            className="h-9 bg-[#f3f4f6]/95 border-b border-gray-300/50 flex items-center px-4 cursor-grab active:cursor-grabbing select-none relative justify-center"
            onMouseDown={handleMouseDown}
            onDoubleClick={toggleMaximize}
            onTouchStart={(e) => {
                // Simple Touch Drag Support
                if(isMaximized) return;
                onFocus();
                const touch = e.touches[0];
                setIsDragging(true);
                setDragOffset({ x: touch.clientX - position.x, y: touch.clientY - position.y });
            }}
            onTouchMove={(e) => {
                if(isDragging) {
                    const touch = e.touches[0];
                    setPosition({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
                }
            }}
            onTouchEnd={() => setIsDragging(false)}
        >
            {/* Traffic Lights (Left) */}
            <div className="absolute left-4 flex items-center gap-2 group">
                <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] hover:bg-[#E0443E] flex items-center justify-center transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/50">×</span>
                </button>
                <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24] hover:bg-[#D89E24] flex items-center justify-center transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/50">-</span>
                </button>
                <button onClick={toggleMaximize} className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] hover:bg-[#1AAB29] flex items-center justify-center transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 text-[6px] font-bold text-black/50">▲</span>
                </button>
            </div>

            {/* Title (Center) */}
            <div className="flex items-center gap-2 opacity-80">
                {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-3.5 h-3.5 text-gray-500" }) : icon}
                <span className="text-xs font-semibold text-gray-700 tracking-tight">{title}</span>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-white/60 backdrop-blur-3xl">
            {children}
        </div>

        {/* Resizer Handle */}
        {!isMaximized && (
            <div 
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1 opacity-0 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => {
                    e.stopPropagation(); e.preventDefault();
                    const startX = e.clientX; const startY = e.clientY;
                    const startWidth = size.width; const startHeight = size.height;
                    const handleResize = (moveEvent: MouseEvent) => {
                        setSize({ width: Math.max(300, startWidth + moveEvent.clientX - startX), height: Math.max(200, startHeight + moveEvent.clientY - startY) });
                    };
                    const stopResize = () => { document.removeEventListener('mousemove', handleResize); document.removeEventListener('mouseup', stopResize); };
                    document.addEventListener('mousemove', handleResize); document.addEventListener('mouseup', stopResize);
                }}
            >
                <div className="w-3 h-3 bg-gray-400/50 rounded-br"></div>
            </div>
        )}
    </div>
  );
};

export default WindowFrame;