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
        className="fixed flex flex-col rounded-xl overflow-hidden glass-panel transition-all duration-200 scanline-effect"
        style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            zIndex: zIndex,
            maxWidth: '100vw',
            maxHeight: 'calc(100vh - 80px)', 
            transform: isActive ? 'scale(1.002)' : 'scale(1)',
            opacity: isActive ? 1 : 0.85,
            border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--panel-border)',
        }}
        onMouseDown={onFocus}
    >
        {/* Terminal Header Bar */}
        <div 
            className="h-10 bg-[#121214] border-b border-white/10 flex items-center px-4 cursor-grab active:cursor-grabbing select-none relative justify-between"
            onMouseDown={handleMouseDown}
            onDoubleClick={toggleMaximize}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <button onClick={onClose} className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] transition-all" />
                    <button onClick={onMinimize} className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)] transition-all" />
                    <button onClick={toggleMaximize} className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] transition-all" />
                </div>
                <div className="flex items-center gap-2">
                    {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-4 h-4 ${isActive ? 'text-[var(--accent-primary)]' : 'text-zinc-500'}` }) : icon}
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`}>{title}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px] font-mono text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SECURE_NODE
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-transparent backdrop-blur-sm">
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