
import React from 'react';

interface InvestingComWidgetProps {
    theme: 'light' | 'dark';
}

const InvestingComWidget: React.FC<InvestingComWidgetProps> = ({ theme }) => {
    const iframeSrc = `https://id.widgets.investing.com/live-currency-cross-rates?theme=${theme === 'dark' ? 'darkTheme' : 'lightTheme'}`;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <iframe 
                src={iframeSrc}
                width="100%" 
                frameBorder="0" 
                allowTransparency={true} 
                marginWidth={0} 
                marginHeight={0}
                style={{ flexGrow: 1, border: 'none' }}
                title="Live Currency Cross Rates"
            ></iframe>
            <div 
                className="poweredBy" 
                style={{ 
                    flexShrink: 0,
                    fontFamily: 'Arial, Helvetica, sans-serif', 
                    fontSize: '11px', 
                    color: 'var(--color-text-tertiary)', 
                    textAlign: 'right', 
                    padding: '4px 10px',
                    backgroundColor: 'var(--color-widget-bg)',
                }}
            >
                Didukung Oleh <a 
                    href="https://id.investing.com?utm_source=WMT&utm_medium=referral&utm_campaign=LIVE_CURRENCY_X_RATES&utm_content=Footer%20Link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                    Investing.com
                </a>
            </div>
        </div>
    );
};

export default InvestingComWidget;
