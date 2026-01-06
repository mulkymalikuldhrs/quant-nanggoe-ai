import React, { useState, useEffect } from 'react';
import { LoaderIcon } from './Icons';
import { getActiveSessions, SESSIONS } from '../services/marketDataService';

const pad = (num: number) => num.toString().padStart(2, '0');

const MarketSessionWidget: React.FC = () => {
    const [activeSessions, setActiveSessions] = useState<string[]>([]);
    const [countdown, setCountdown] = useState({ label: '', time: '' });
    const [isMarketOpen, setIsMarketOpen] = useState(true);

    useEffect(() => {
        const timerId = setInterval(() => {
            const now = new Date();
            const currentUTCDay = now.getUTCDay();
            const currentUTCHour = now.getUTCHours();
            const currentUTCMinutes = now.getUTCMinutes();
            const currentUTCSeconds = now.getUTCSeconds();
            const currentTimeInMinutes = currentUTCHour * 60 + currentUTCMinutes;

            const currentActiveSessions = getActiveSessions();
            setActiveSessions(currentActiveSessions);
            const marketIsOpen = currentActiveSessions.length > 0 || !( (currentUTCDay === 6) || (currentUTCDay === 0 && currentUTCHour < 22) || (currentUTCDay === 5 && currentUTCHour >= 22));
            setIsMarketOpen(marketIsOpen);
            
            if (!marketIsOpen) {
                // Calculate time until market open (Sunday 22:00 UTC)
                let daysUntilOpen = 0;
                if (currentUTCDay === 5) { // Friday after close
                    daysUntilOpen = 2;
                } else if (currentUTCDay === 6) { // Saturday
                    daysUntilOpen = 1;
                } else { // Sunday before open
                    daysUntilOpen = 0;
                }

                const openTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilOpen, 22, 0, 0));
                const diffInSeconds = Math.floor((openTime.getTime() - now.getTime()) / 1000);

                const hours = Math.floor(diffInSeconds / 3600);
                const minutes = Math.floor((diffInSeconds % 3600) / 60);
                const seconds = diffInSeconds % 60;
                
                setCountdown({
                    label: 'MARKET OPENS IN',
                    time: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
                });

            } else {
                // Calculate countdown to next session event
                const events = SESSIONS.flatMap(s => [
                    { time: s.start * 60, type: 'OPENS', name: s.name },
                    { time: s.end * 60, type: 'CLOSES', name: s.name }
                ]).sort((a, b) => a.time - b.time);

                let nextEvent = events.find(e => e.time > currentTimeInMinutes);

                if (!nextEvent) {
                    nextEvent = events[0]; // Next day's first event
                }
                
                const nextEventTime = nextEvent.time;
                let diffInSeconds: number;
                
                if (nextEventTime > currentTimeInMinutes) {
                     diffInSeconds = (nextEventTime - currentTimeInMinutes) * 60 - currentUTCSeconds;
                } else {
                     const minutesInDay = 24 * 60;
                     diffInSeconds = (minutesInDay - currentTimeInMinutes + nextEventTime) * 60 - currentUTCSeconds;
                }
               
                const hours = Math.floor(diffInSeconds / 3600);
                const minutes = Math.floor((diffInSeconds % 3600) / 60);
                const seconds = diffInSeconds % 60;

                setCountdown({
                    label: `${nextEvent.name} ${nextEvent.type}`,
                    time: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
                });
            }

        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    if (!countdown.time) {
        return <div className="flex items-center justify-center gap-6 font-mono text-sm flex-grow"><LoaderIcon className="w-4 h-4" /></div>;
    }
    
    if (!isMarketOpen) {
        return (
             <div className="flex items-center justify-center gap-2 font-mono text-sm flex-grow">
                 <span className="text-red-500 font-bold tracking-wider">MARKET CLOSED</span>
                 <span className="text-gray-400">|</span>
                 <span className="text-gray-400">{countdown.label}</span>
                 <span className="text-yellow-400 font-bold">{countdown.time}</span>
             </div>
        )
    }

    const sessionColors: { [key: string]: string } = {
        'ASIA': 'bg-purple-500',
        'LONDON': 'bg-blue-500',
        'NEW YORK': 'bg-orange-500'
    };

    return (
        <div className="flex items-center justify-center gap-6 font-mono text-sm flex-grow">
            <div className="flex items-center gap-3">
                {SESSIONS.map(session => (
                    <div key={session.name} className="flex items-center gap-1.5">
                         <div className={`w-2 h-2 rounded-full transition-all ${activeSessions.includes(session.name) ? sessionColors[session.name] + ' shadow-lg ' + sessionColors[session.name].replace('bg-','shadow-') + '/50' : 'bg-gray-600'}`}></div>
                         <span className={activeSessions.includes(session.name) ? 'text-gray-100 font-bold' : 'text-gray-500'}>
                            {session.name}
                         </span>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-400">{countdown.label} IN:</span>
                <span className="text-yellow-400 font-bold">{countdown.time}</span>
            </div>
        </div>
    );
};

export default MarketSessionWidget;