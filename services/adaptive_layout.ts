import { useState, useEffect } from 'react';

export interface WindowLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const useAdaptiveLayout = () => {
    const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setScreenSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getLayout = (type: string): WindowLayout => {
        const { width, height } = screenSize;
        const isSmall = width < 1024;
        
        switch (type) {
            case 'terminal':
                return {
                    x: 20,
                    y: 60,
                    width: isSmall ? width - 40 : 600,
                    height: isSmall ? (height / 2) - 40 : 620
                };
            case 'browser':
                return {
                    x: isSmall ? 20 : 640,
                    y: isSmall ? (height / 2) + 40 : 60,
                    width: isSmall ? width - 40 : width - 680,
                    height: isSmall ? (height / 2) - 100 : height - 420
                };
            case 'monitor':
                return {
                    x: 20,
                    y: height - 380,
                    width: 600,
                    height: 300
                };
            case 'market':
                return {
                    x: 640,
                    y: height - 340,
                    width: 450,
                    height: 260
                };
            case 'portfolio':
                return {
                    x: 1110,
                    y: height - 340,
                    width: width - 1130,
                    height: 260
                };
            default:
                return { x: 100, y: 100, width: 800, height: 600 };
        }
    };

    return { screenSize, getLayout };
};
