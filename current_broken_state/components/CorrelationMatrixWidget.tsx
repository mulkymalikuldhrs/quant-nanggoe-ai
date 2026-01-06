
import React from 'react';
import Widget from './Widget';
import { ActivityIcon } from './Icons';

// Standard Cross-Asset Correlation Logic (Approximation for Display)
// These are NOT random. They represent typical safe-haven vs risk-on dynamics.
const ASSETS = ['USD', 'XAU', 'SPX', 'BTC', 'OIL'];

// 1 = Perfect Positive, -1 = Perfect Inverse, 0 = Uncorrelated
const FIXED_MATRIX = [
    // USD   XAU    SPX    BTC    OIL
    [ 1.00, -0.82, -0.40,  0.15, -0.30], // USD
    [-0.82,  1.00,  0.35,  0.25,  0.45], // XAU (Gold)
    [-0.40,  0.35,  1.00,  0.65,  0.55], // SPX (Stocks)
    [ 0.15,  0.25,  0.65,  1.00,  0.10], // BTC (Crypto)
    [-0.30,  0.45,  0.55,  0.10,  1.00]  // OIL
];

const CorrelationMatrixWidget: React.FC = () => {
  const getColor = (val: number) => {
    if (val === 1) return 'bg-gray-800/20 text-gray-600'; // Self
    if (val >= 0.5) return 'bg-green-500/20 text-green-400 font-bold';
    if (val <= -0.5) return 'bg-red-500/20 text-red-400 font-bold';
    return 'bg-white/[0.03] text-gray-500';
  };

  return (
    <Widget title="Intermarket Correlation (Static)" icon={<ActivityIcon className="w-4 h-4" />}>
      <div className="h-full flex flex-col font-mono text-[9px]">
        <div className="grid grid-cols-6 gap-1 mb-1">
          <div className="p-1"></div>
          {ASSETS.map(a => <div key={a} className="p-1 text-center font-bold text-gray-400">{a}</div>)}
        </div>
        <div className="flex-grow space-y-1">
          {ASSETS.map((a, i) => (
            <div key={a} className="grid grid-cols-6 gap-1">
              <div className="p-1 font-bold text-gray-400">{a}</div>
              {FIXED_MATRIX[i].map((val, j) => (
                <div 
                  key={j} 
                  className={`p-1 text-center rounded-sm border border-white/5 flex items-center justify-center ${getColor(val)}`}
                >
                  {val.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 text-[8px] text-gray-600 italic border-t border-white/5 pt-1">
          * Based on standard historical safe-haven/risk-on dynamics.
        </div>
      </div>
    </Widget>
  );
};

export default CorrelationMatrixWidget;
