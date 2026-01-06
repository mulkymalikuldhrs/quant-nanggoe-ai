
import React from 'react';
import { MessageRole, ChatMessage as ChatMessageType } from '../types';
import { IconBot, IconUser, IconLink, IconSearch, IconCode } from './Icons';

interface Props {
  message: ChatMessageType;
}

const ChatMessage: React.FC<Props> = ({ message }) => {
  const isModel = message.role === MessageRole.MODEL;

  const handleRunCode = (code: string) => {
      try {
          console.log("--- Manual Execution ---");
          const func = new Function(code);
          func();
      } catch(e) {
          console.error(e);
          alert("Execution Error (Check Console)");
      }
  }

  const renderChart = (jsonString: string) => {
      try {
          const chartData = JSON.parse(jsonString);
          if (chartData.type !== 'chart') return null;
          
          const data = chartData.data as {label: string, value: number}[];
          const maxValue = Math.max(...data.map(d => d.value));
          
          return (
              <div className="my-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">{chartData.title || "Data Analysis"}</h4>
                  <div className="flex items-end gap-2 h-40 pb-6 border-b border-gray-100">
                      {data.map((d, i) => {
                          const height = (d.value / maxValue) * 100;
                          return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                  <div 
                                    className="w-full bg-blue-500/80 hover:bg-blue-600 transition-all rounded-t-sm relative" 
                                    style={{ height: `${height}%` }}
                                  >
                                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                          {d.value}
                                      </span>
                                  </div>
                                  <span className="absolute -bottom-6 text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
                              </div>
                          )
                      })}
                  </div>
              </div>
          );
      } catch (e) {
          return null;
      }
  }

  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const content = part.slice(3, -3).replace(/^[a-z]+\n/, '');
        
        if (content.trim().startsWith('{') && content.includes('"type": "chart"')) {
            const chart = renderChart(content);
            if (chart) return <div key={index}>{chart}</div>;
        }

        return (
          <div key={index} className="my-4 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner group">
            <div className="flex items-center justify-between px-4 py-1.5 bg-gray-100 border-b border-gray-200">
               <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">CODE</span>
               <button 
                  onClick={() => handleRunCode(content)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[9px] text-green-600 hover:text-green-700 transition-all px-2 py-0.5 border border-green-200 bg-white rounded shadow-sm"
               >
                   <IconCode className="w-3 h-3" /> RUN
               </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-gray-800 custom-scrollbar">
              <code>{content}</code>
            </pre>
          </div>
        );
      }
      
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={index}>
          {boldParts.map((subPart, subIndex) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={subIndex} className="font-bold text-gray-900">{subPart.slice(2, -2)}</strong>;
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`relative max-w-[85%] rounded-2xl p-4 shadow-sm ${
          isModel 
            ? 'bg-white text-gray-800 rounded-tl-none border border-gray-200/50' 
            : 'bg-[#007AFF] text-white rounded-tr-none shadow-md shadow-blue-500/20'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
           {isModel && (
               <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Quant Nanggroe AI</span>
           )}
           {!isModel && (
               <span className="text-[10px] font-bold uppercase tracking-wide text-blue-100 w-full text-right">You</span>
           )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.attachments.map((att, idx) => (
               att.mimeType.startsWith('image') && (
                 <div key={idx} className="rounded-lg overflow-hidden border border-white/20 max-w-[200px]">
                   <img src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="w-full h-auto" />
                 </div>
               )
            ))}
          </div>
        )}

        {/* Content */}
        <div className={`prose prose-sm max-w-none leading-relaxed text-[13px] ${isModel ? 'text-gray-700' : 'text-white'} ${isModel ? 'prose-headings:text-gray-900' : 'prose-headings:text-white prose-strong:text-white prose-code:text-white'}`}>
          {message.error ? (
            <div className="text-red-600 bg-red-50 border border-red-100 p-2 rounded">
              System Error: {message.text}
            </div>
          ) : (
            renderContent(message.text)
          )}
        </div>

        {/* Sources */}
        {message.groundingSources && message.groundingSources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-[10px] text-blue-600 font-bold uppercase">
              <IconSearch className="w-3 h-3" />
              <span>Verified Data</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.groundingSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 transition-all text-xs text-gray-600 hover:text-blue-600 shadow-sm"
                >
                  <IconLink className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
