
import React, { useState, useRef, useEffect } from 'react';
import { IconSend, IconPaperclip, IconX } from './Icons';
import { Attachment } from '../types';

interface Props {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<Props> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(input.trim(), attachments);
      setInput('');
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = (event.target.result as string).split(',')[1];
          const newAttachment: Attachment = {
            mimeType: file.type,
            data: base64String,
            name: file.name
          };
          setAttachments(prev => [...prev, newAttachment]);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="w-full px-4 pb-4 pt-2 bg-white/40 backdrop-blur-md border-t border-white/60">
      
      {/* Attachment Previews */}
      {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto">
              {attachments.map((att, idx) => (
                  <div key={idx} className="relative group bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[8px] text-gray-500 font-bold">
                           FILE
                      </div>
                      <span className="text-[10px] text-gray-700 truncate max-w-[80px]">{att.name}</span>
                      <button 
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                          <IconX className="w-2 h-2" />
                      </button>
                  </div>
              ))}
          </div>
      )}

      <div className="relative group">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all shadow-sm"
        >
          {/* File Button */}
          <div className="pb-1 pl-1">
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileSelect} 
                 className="hidden" 
                 accept="image/*,text/*,application/json,application/pdf"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Attach File"
              >
                  <IconPaperclip className="w-4 h-4" />
              </button>
          </div>
          
          <div className="flex-1 min-w-0">
             <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Quant Nanggroe..."
              disabled={isLoading}
              rows={1}
              className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm py-2 px-1 resize-none focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-0.5 transition-all duration-300 ${
              (input.trim() || attachments.length > 0) && !isLoading
                ? 'bg-[#007AFF] hover:bg-blue-600 text-white shadow-md transform hover:scale-105'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
             <IconSend className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputArea;
