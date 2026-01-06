import React, { useEffect, useState } from 'react';
import { TradeSignalData } from '../types';
import { SignalIcon } from './Icons';
import { playSignalSound } from '../services/notificationService';

interface NotificationPopupProps {
    notification: TradeSignalData | null;
    onClear: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification, onClear }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            
            playSignalSound();

            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClear, 300); // Wait for fade out animation
            }, 5000); // Show for 5 seconds

            return () => clearTimeout(timer);
        }
    }, [notification, onClear]);

    if (!notification) return null;

    const isBuy = notification.direction === 'BUY';

    return (
        <div 
            className={`fixed bottom-5 right-5 w-80 bg-[var(--color-widget-bg)] backdrop-blur-xl border border-[var(--color-border)] rounded-lg shadow-2xl z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            role="alert"
        >
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isBuy ? 'bg-sky-500' : 'bg-rose-500'} rounded-l-lg`}></div>
            <div className="p-4 pl-6">
                <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isBuy ? 'bg-sky-500/20 text-sky-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        <SignalIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-[var(--color-text)]">New Signal Generated</h4>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                           <span className={`font-bold ${isBuy ? 'text-sky-400' : 'text-rose-400'}`}>{notification.direction}</span>{' '}
                           {notification.pair} @ {notification.entry}
                        </p>
                    </div>
                </div>
                 <button onClick={() => setIsVisible(false)} className="absolute top-2 right-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]">&times;</button>
            </div>
        </div>
    );
};

export default NotificationPopup;