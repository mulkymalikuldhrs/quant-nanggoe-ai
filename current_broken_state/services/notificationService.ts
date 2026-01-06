import { TradeSignalData } from '../types';

let audioContext: AudioContext | null = null;
const getAudioContext = () => {
    if (typeof window !== 'undefined' && !audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};


export const playSignalSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
        console.error("Error playing sound:", error);
    }
};


export const requestPermission = async (): Promise<void> => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notification');
        return;
    }

    if (Notification.permission === 'default') {
        await Notification.requestPermission();
    }
};

export const showSignalNotification = (signal: TradeSignalData): void => {
    if (!('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted') {
        const { pair, direction, entry } = signal;
        const title = `New Dhaher Terminal Signal`;
        const body = `${direction} ${pair} at ${entry}`;
        
        new Notification(title, {
            body,
            icon: '/logo.png', // Assuming a logo exists in public folder
            badge: '/logo.png',
            tag: `signal-${Date.now()}`
        });
    }
};