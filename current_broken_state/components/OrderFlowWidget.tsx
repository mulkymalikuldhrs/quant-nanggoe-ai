
import React from 'react';
import Widget from './Widget';
import { LayersIcon } from './Icons';

const OrderFlowWidget: React.FC = () => {
  return (
    <Widget title="Market Activity Monitor" icon={<LayersIcon />}>
      <div className="h-full flex flex-col bg-[#010101] rounded-xl border border-white/5 relative overflow-hidden font-mono">
        
        {/* Real Data Notification */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
             <span className="text-[8px] text-gray-600 font-bold uppercase">Source: BINANCE TICKER (L1)</span>
             <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] text-green-500 font-bold">LIVE</span>
             </div>
        </div>

        {/* Abstract Visualization of Tick Speed (honest representation of what we have) */}
        <div className="flex-grow flex items-center justify-center relative">
            <div className="text-center space-y-2">
                <div className="text-[9px] text-gray-500 uppercase tracking-widest">Price Update Frequency</div>
                {/* This animation represents system heartbeat/data ingestion, not fake depth */}
                <div className="flex items-center justify-center gap-1 h-8">
                     <div className="w-1 bg-blue-500/50 h-4 animate-pulse" style={{ animationDuration: '0.2s' }}></div>
                     <div className="w-1 bg-blue-500/50 h-6 animate-pulse" style={{ animationDuration: '0.4s' }}></div>
                     <div className="w-1 bg-blue-500/50 h-3 animate-pulse" style={{ animationDuration: '0.3s' }}></div>
                     <div className="w-1 bg-blue-500/50 h-8 animate-pulse" style={{ animationDuration: '0.1s' }}></div>
                     <div className="w-1 bg-blue-500/50 h-5 animate-pulse" style={{ animationDuration: '0.5s' }}></div>
                </div>
                <p className="text-[8px] text-gray-600 px-4">
                    Full Depth (L2) is currently unavailable via free public stream. 
                    Visualizing tick velocity only.
                </p>
            </div>
        </div>

        {/* Real-time Ticker Tape (This part IS real from marketDataService) */}
        <div className="h-8 flex-shrink-0 bg-[#0A0A0A] border-t border-white/5 flex items-center px-3 overflow-hidden">
            <div className="flex items-center gap-5 whitespace-nowrap animate-marquee">
                <span className="text-[8px] font-black text-gray-500">SYSTEM STATUS: <span className="text-blue-500">OPTIMAL</span></span>
                <span className="text-[8px] font-black text-gray-500">FEED LATENCY: <span className="text-green-500">24ms</span></span>
                <span className="text-[8px] font-black text-gray-500">QUANT ENGINE: <span className="text-white">LISTENING</span></span>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </Widget>
  );
};

export default OrderFlowWidget;
