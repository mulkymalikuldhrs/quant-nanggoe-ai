
import React from 'react';
import { OpenPosition } from '../types';

interface PositionsWidgetProps {
  positions: OpenPosition[];
  onClosePosition: (id: string) => void;
}

const PositionRow: React.FC<{ position: OpenPosition, onClose: () => void }> = ({ position, onClose }) => {
    const pl = position.currentPL; // P/L is now static, not simulated.

    const isBuy = position.direction === 'BUY';
    const isProfit = pl >= 0;

    return (
        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="p-1.5 font-semibold text-gray-200">
                {position.pair.replace(/([A-Z]{3,})([A-Z]{3,})/, '$1/$2')}
            </td>
            <td className="p-1.5">
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isBuy ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {position.direction}
                </span>
            </td>
            <td className="p-1.5 text-gray-300 text-right">{position.positionSizeLots.toFixed(2)}</td>
            <td className={`p-1.5 font-bold text-right ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                {isProfit ? '+' : ''}${pl.toFixed(2)}
            </td>
            <td className="p-1.5 text-right">
                <button 
                    onClick={onClose} 
                    className="px-2 py-0.5 text-[10px] font-bold bg-gray-500/20 hover:bg-red-500/30 text-gray-300 hover:text-red-200 rounded-md transition-colors"
                >
                    CLOSE
                </button>
            </td>
        </tr>
    );
};

const PositionsWidget: React.FC<PositionsWidgetProps> = ({ positions, onClosePosition }) => {

  if (positions.length === 0) {
    return (
        <div className="flex items-center justify-center h-full text-center text-gray-500 font-mono text-xs py-4">
            -- NO OPEN POSITIONS --
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto text-xs font-mono">
        <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
                <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="p-1.5 font-semibold">PAIR</th>
                    <th className="p-1.5 font-semibold">DIR.</th>
                    <th className="p-1.5 font-semibold text-right">SIZE</th>
                    <th className="p-1.5 font-semibold text-right">P/L</th>
                    <th className="p-1.5 font-semibold text-right"></th>
                </tr>
            </thead>
            <tbody>
                {positions.map((pos) => (
                    <PositionRow key={pos.id} position={pos} onClose={() => onClosePosition(pos.id)} />
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsWidget;
