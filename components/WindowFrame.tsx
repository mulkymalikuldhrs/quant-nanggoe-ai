
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

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
             if (size.width > window.innerWidth) setSize(prev => ({ ...prev, width: window.innerWidth - 20 }));
             if (position.x < 0) setPosition(prev => ({ ...prev, x: 0 }));
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size, position]);

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
          setPosition({ x: 0, y: 40 }); // Start below Top Bar (which is 40px)
          setSize({ width: window.innerWidth, height: window.innerHeight - 120 }); // Account for Dock and Bar
      }
      setIsMaximized(!isMaximized);
  };

  if (!isOpen || isMinimized) return null;

  return (
    <div 
        ref={windowRef}
        className={`fixed flex flex-col rounded-xl overflow-hidden glass-panel transition-all duration-300 ${isActive ? 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]' : 'shadow-xl opacity-90'}`}
        style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            zIndex: zIndex,
            maxWidth: '100vw',
            maxHeight: 'calc(100vh - 80px)', 
            transform: isActive ? 'scale(1)' : 'scale(0.995)',
            border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.05)',
        }}
        onMouseDown={onFocus}
    >
        {/* macOS Style Title Bar */}
        <div 
            className="h-10 bg-[#121214]/60 backdrop-blur-3xl border-b border-white/5 flex items-center px-4 cursor-grab active:cursor-grabbing select-none relative"
            onMouseDown={handleMouseDown}
            onDoubleClick={toggleMaximize}
        >
            {/* Traffic Lights */}
            <div className="flex items-center gap-2 group/lights w-16">
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-3 h-3 rounded-full bg-[#ff5f57] flex items-center justify-center group-hover/lights:after:content-['×'] after:text-[8px] after:text-black/50 after:font-bold" />
                <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="w-3 h-3 rounded-full bg-[#febc2e] flex items-center justify-center group-hover/lights:after:content-['−'] after:text-[8px] after:text-black/50 after:font-bold" />
                <button onClick={(e) => { e.stopPropagation(); toggleMaximize(); }} className="w-3 h-3 rounded-full bg-[#28c840] flex items-center justify-center group-hover/lights:after:content-['+'] after:text-[8px] after:text-black/50 after:font-bold" />
            </div>

            {/* Title & Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 opacity-60">
                    {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-3.5 h-3.5' }) : icon}
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-100">{title}</span>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-black/20">
            {children}
        </div>

        {/* Resizer Handle */}
        {!isMaximized && (
            <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
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
            />
        )}
    </div>
  );
};

export default WindowFrame;
