
import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconTerminal, IconChart, IconBook, IconGlobe } from './Icons';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCommand: (cmd: string) => void;
}

const OmniBar: React.FC<Props> = ({ isOpen, onClose, onCommand }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onCommand(input);
            setInput('');
            onClose();
        }
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
            <div className="w-[600px] max-w-[90vw] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
                <div className="flex items-center px-4 py-3 border-b border-gray-100">
                    <IconSearch className="w-5 h-5 text-gray-400 mr-3" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Alpha Prime or type a command..."
                        className="flex-1 text-lg font-medium text-gray-800 focus:outline-none placeholder-gray-400"
                    />
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-mono">ESC</span>
                </div>
                
                {input.length === 0 && (
                    <div className="bg-gray-50 p-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Suggestions</div>
                        <div className="space-y-1">
                            <button onClick={() => { onCommand("Open Market"); onClose(); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-xs text-gray-700">
                                <div className="bg-orange-100 p-1.5 rounded"><IconChart className="w-3 h-3 text-orange-600" /></div>
                                Open Market Watch
                            </button>
                            <button onClick={() => { onCommand("Analyze BTC"); onClose(); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-xs text-gray-700">
                                <div className="bg-blue-100 p-1.5 rounded"><IconTerminal className="w-3 h-3 text-blue-600" /></div>
                                Analyze Bitcoin Structure
                            </button>
                            <button onClick={() => { onCommand("Browse News"); onClose(); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-xs text-gray-700">
                                <div className="bg-purple-100 p-1.5 rounded"><IconGlobe className="w-3 h-3 text-purple-600" /></div>
                                Search Latest Financial News
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OmniBar;
