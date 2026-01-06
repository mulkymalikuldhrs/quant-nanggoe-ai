import React, { useState, useEffect } from 'react';

const TimezoneClock: React.FC = () => {
    const [jakartaTime, setJakartaTime] = useState('');
    const [utcTime, setUtcTime] = useState('');

    useEffect(() => {
        const timerId = setInterval(() => {
            const now = new Date();
            
            const jktOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
            setJakartaTime(new Intl.DateTimeFormat('en-GB', jktOptions).format(now));

            const utcOptions: Intl.DateTimeFormatOptions = { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
            setUtcTime(new Intl.DateTimeFormat('en-GB', utcOptions).format(now));

        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="flex items-center gap-4 font-mono w-1/4">
            <div className="flex flex-col items-start">
                <span className="text-gray-400 text-[10px] tracking-widest">JKT (WIB)</span>
                <span className="text-gray-100 font-bold text-base">{jakartaTime}</span>
            </div>
            <div className="flex flex-col items-start">
                <span className="text-gray-400 text-[10px] tracking-widest">MARKET (UTC)</span>
                <span className="text-gray-100 font-bold text-base">{utcTime}</span>
            </div>
        </div>
    );
};

export default TimezoneClock;