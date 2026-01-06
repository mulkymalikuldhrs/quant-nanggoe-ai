import React from 'react';
import { SignalLogEntry } from '../types';

interface SignalLogProps {
  signals: SignalLogEntry[];
}

const SignalLog: React.FC<SignalLogProps> = ({ signals }) => {

  if (signals.length === 0) {
    return (
        <div className="flex items-center justify-center h-full text-center text-gray-500 font-mono text-xs py-4">
            -- NO SIGNALS RECORDED --
        </div>
    );
  }

  const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-GB');
  }
  
  const formatStyle = (style: string) => {
      if (!style) return '';
      // Capitalize first letter of each word, including after a slash/dash/space
      return style.toLowerCase().replace(/(^|\/|-|\s)\w/g, char => char.toUpperCase());
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto text-xs font-mono">
        <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
                <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="p-1.5 font-semibold">PAIR</th>
                    <th className="p-1.5 font-semibold">DIR.</th>
                    <th className="p-1.5 font-semibold">STYLE</th>
                    <th className="p-1.5 font-semibold text-right">TIME</th>
                </tr>
            </thead>
            <tbody>
                {signals.slice(0, 50).map((signal) => {
                    const isBuy = signal.direction === 'BUY';
                    return (
                        <tr key={signal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-1.5 font-semibold text-gray-200">
                                {signal.pair.replace(/([A-Z]{3,})([A-Z]{3,})/, '$1/$2')}
                            </td>
                             <td className="p-1.5">
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isBuy ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {signal.entryType === 'MARKET' ? 'M' : 'L'} {signal.direction}
                                </span>
                            </td>
                            <td className="p-1.5 text-gray-400">
                                {formatStyle(signal.tradingStyle)}
                            </td>
                            <td className={`p-1.5 font-semibold text-right text-gray-400`}>
                                {formatTime(signal.timestamp)}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default SignalLog;