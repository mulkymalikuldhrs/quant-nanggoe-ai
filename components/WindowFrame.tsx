
import React, { useState, useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../App';

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
    const { theme } = useContext(ThemeContext);
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
            setPosition({ x: 0, y: 32 }); // Start below Top Bar (which is 32px/8rem)
            setSize({ width: window.innerWidth, height: window.innerHeight - 100 }); // Account for Dock and Bar
        }
        setIsMaximized(!isMaximized);
    };

    if (!isOpen || isMinimized) return null;

    return (
      <div 
          ref={windowRef}
          className={`fixed flex flex-col rounded-xl overflow-hidden backdrop-blur-3xl transition-all duration-300 ${isActive ? 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] scale-100' : 'shadow-lg opacity-90 scale-[0.995]'} ${theme === 'dark' ? 'bg-[#09090b]/80 border-white/10' : 'bg-white/80 border-black/10'}`}
          style={{
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
              zIndex: zIndex,
              maxWidth: '100vw',
              maxHeight: 'calc(100vh - 80px)', 
              border: isActive ? (theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)') : (theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'),
          }}
          onMouseDown={onFocus}
      >
          {/* Glass Edition Title Bar */}
          <div 
              className={`h-9 border-b flex items-center px-4 cursor-grab active:cursor-grabbing select-none relative transition-colors duration-500 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
              onMouseDown={handleMouseDown}
              onDoubleClick={toggleMaximize}
          >
              {/* Control Buttons (macOS Traffic Light Style) */}
              <div className="flex items-center gap-2 absolute left-4">
                  <button 
                      onClick={(e) => { e.stopPropagation(); onClose(); }} 
                      className="group flex items-center justify-center w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:brightness-90 transition-all duration-200"
                  >
                      <span className="text-[8px] text-black/40 opacity-0 group-hover:opacity-100 font-bold">×</span>
                  </button>
                  <button 
                      onClick={(e) => { e.stopPropagation(); onMinimize(); }} 
                      className="group flex items-center justify-center w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:brightness-90 transition-all duration-200"
                  >
                      <span className="text-[12px] text-black/40 opacity-0 group-hover:opacity-100 font-bold leading-[0] mb-0.5">−</span>
                  </button>
                  <button 
                      onClick={(e) => { e.stopPropagation(); toggleMaximize(); }} 
                      className="group flex items-center justify-center w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:brightness-90 transition-all duration-200"
                  >
                      <span className="text-[6px] text-black/40 opacity-0 group-hover:opacity-100 font-bold">+</span>
                  </button>
              </div>

              {/* Title & Icon */}
              <div className="flex-1 flex items-center justify-center gap-2 px-8">
                  <div className="flex items-center gap-2 opacity-80">
                      {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-3.5 h-3.5 ${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'}` }) : icon}
                      <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'dark' ? 'text-white/90' : 'text-zinc-800'}`}>{title}</span>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <button 
                      onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
                      className={`p-1 rounded-md transition-all opacity-40 hover:opacity-100 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                  >
                     <div className={`w-3 h-3 border rounded-[2px] ${theme === 'dark' ? 'border-white/40' : 'border-black/40'}`} />
                  </button>
                  <div className={`w-1 h-1 rounded-full animate-pulse ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'}`} />
              </div>
          </div>

          {/* Content Area */}
          <div className={`flex-1 overflow-hidden relative ${theme === 'dark' ? 'bg-black/20' : 'bg-white/20'}`}>
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
