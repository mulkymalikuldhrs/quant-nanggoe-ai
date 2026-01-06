import React from 'react';
import { SignalLogEntry } from '../types';
import SignalDisplayWidget from './SignalDisplayWidget';
import Widget from './Widget';

interface DualSignalDisplayProps {
  swingSignal: SignalLogEntry | null;
  scalpingSignal: SignalLogEntry | null;
  onManualExecute: (signal: SignalLogEntry) => void;
  isAutonomousMode: boolean;
}

const SignalColumn: React.FC<{
    title: string;
    signal: SignalLogEntry | null;
    onManualExecute: (signal: SignalLogEntry) => void;
    isAutonomousMode: boolean;
}> = ({ title, signal, onManualExecute, isAutonomousMode }) => {
    return (
        <div className="flex flex-col h-full bg-[var(--color-input-bg)] rounded-xl p-1">
             <h3 className="font-bold text-center text-[var(--color-text-secondary)] py-2 uppercase tracking-widest text-sm">
                {title}
             </h3>
             <div className="flex-grow p-2 min-h-0">
                <SignalDisplayWidget
                    signal={signal}
                    onManualExecute={onManualExecute}
                    isAutonomousMode={isAutonomousMode}
                />
            </div>
        </div>
    )
}

const DualSignalDisplay: React.FC<DualSignalDisplayProps> = ({ swingSignal, scalpingSignal, onManualExecute, isAutonomousMode }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full p-1">
        <SignalColumn 
            title="Swing / Intraday"
            signal={swingSignal}
            onManualExecute={onManualExecute}
            isAutonomousMode={isAutonomousMode}
        />
        <SignalColumn 
            title="Scalping"
            signal={scalpingSignal}
            onManualExecute={onManualExecute}
            isAutonomousMode={isAutonomousMode}
        />
    </div>
  );
};

export default DualSignalDisplay;
