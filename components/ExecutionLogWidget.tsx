import React, { useRef, useEffect } from 'react';
import { AgentLogEntry } from '../types';

interface ExecutionLogWidgetProps {
  log: AgentLogEntry[];
}

const LogEntry: React.FC<{ entry: AgentLogEntry }> = ({ entry }) => {
    const getLogColor = (type: AgentLogEntry['type']) => {
        switch (type) {
            case 'SUCCESS': return 'text-green-400';
            case 'ERROR': return 'text-red-400';
            case 'COMMAND': return 'text-sky-400';
            case 'INFO':
            default: return 'text-gray-400';
        }
    };
    
    const time = new Date(entry.timestamp).toLocaleTimeString('en-GB');

    return (
        <div className="flex items-start gap-2">
            <span className="text-gray-600 select-none">{time}</span>
            <p className={`flex-1 ${getLogColor(entry.type)}`}>
                <span className="font-semibold">{entry.type === 'COMMAND' ? '> ' : ''}</span>
                {entry.message}
            </p>
        </div>
    );
};


const ExecutionLogWidget: React.FC<ExecutionLogWidgetProps> = ({ log }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [log]);
    
    return (
        <div ref={scrollRef} className="h-full overflow-y-auto p-2 font-mono text-xs space-y-1">
            {log.map(entry => (
                <LogEntry key={entry.id} entry={entry} />
            ))}
        </div>
    );
};

export default ExecutionLogWidget;
