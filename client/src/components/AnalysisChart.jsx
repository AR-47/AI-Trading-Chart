import React, { useEffect, useRef } from 'react';

function AnalysisChart({ symbol, theme = 'dark' }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            if (window.TradingView && containerRef.current) {
                new window.TradingView.widget({
                    autosize: true,
                    symbol: `BINANCE:${symbol}`,
                    interval: 'D',
                    timezone: 'Etc/UTC',
                    theme: theme,
                    style: '1',
                    locale: 'en',
                    toolbar_bg: '#f1f3f6',
                    enable_publishing: false,
                    allow_symbol_change: false,
                    container_id: containerRef.current.id,
                    hide_side_toolbar: false, // Enable drawing tools
                    studies: [
                        "RSI@tv-basicstudies",
                        "MASimple@tv-basicstudies"
                    ]
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup script if needed, though usually not necessary for single page apps
            // document.body.removeChild(script); 
        };
    }, [symbol, theme]);

    return (
        <div
            id={`tradingview_${Math.random().toString(36).substring(7)}`}
            ref={containerRef}
            style={{ height: '100%', width: '100%' }}
        />
    );
}

export default AnalysisChart;
