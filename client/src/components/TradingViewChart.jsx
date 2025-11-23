import React, { useEffect, useRef } from 'react';
import './TradingViewChart.css';

function TradingViewChart({ currentSymbol, timeframe, prediction }) {
    const containerRef = useRef(null);
    const widgetRef = useRef(null);

    // Map prediction timeframes to TradingView intervals
    const getChartInterval = (tf) => {
        const intervalMap = {
            '30m': '30',    // 30 minutes
            '1h': '60',     // 1 hour
            '4h': '240',    // 4 hours
            '1d': 'D',      // 1 day
            '1w': 'W',      // 1 week
            '1M': 'M'       // 1 month
        };
        return intervalMap[tf] || 'D';
    };

    useEffect(() => {
        console.log(`Updating chart: Symbol=${currentSymbol}, Timeframe=${timeframe}`);

        // Safely clear previous widget
        if (widgetRef.current) {
            try {
                if (widgetRef.current.remove) {
                    widgetRef.current.remove();
                }
            } catch (err) {
                console.warn("Widget removal error:", err);
            }
            widgetRef.current = null;
        }

        // Explicitly clear the container to ensure no artifacts remain
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        // Generate a unique ID for this specific chart instance
        const uniqueId = `tradingview_${currentSymbol}_${timeframe}_${Date.now()}`;

        if (containerRef.current && window.TradingView) {
            const interval = getChartInterval(timeframe);
            console.log(`Setting chart interval to: ${interval}`);

            // Create a new div with the unique ID inside the container
            const chartDiv = document.createElement("div");
            chartDiv.id = uniqueId;
            chartDiv.style.height = "100%";
            chartDiv.style.width = "100%";
            containerRef.current.appendChild(chartDiv);

            try {
                const widget = new window.TradingView.widget({
                    autosize: true,
                    symbol: `BINANCE:${currentSymbol}`,
                    interval: interval,
                    timezone: "Etc/UTC",
                    theme: "dark",
                    style: "1",
                    locale: "en",
                    toolbar_bg: "#1E222D",
                    enable_publishing: false,
                    hide_side_toolbar: false,
                    allow_symbol_change: false,
                    save_image: false,
                    container_id: uniqueId,
                    studies: [],
                    backgroundColor: "#131722",
                    gridColor: "#1E222D",
                    hide_top_toolbar: false,
                    hide_legend: false,
                    withdateranges: true,
                    range: "12M",
                    details: true,
                    hotlist: true,
                    calendar: true,
                    show_popup_button: true,
                    popup_width: "1000",
                    popup_height: "650",
                    support_host: "https://www.tradingview.com"
                });

                widgetRef.current = widget;
            } catch (err) {
                console.error("Widget creation error:", err);
            }
        }

        return () => {
            if (widgetRef.current) {
                try {
                    if (widgetRef.current.remove) {
                        widgetRef.current.remove();
                    }
                } catch (err) {
                    console.warn("Widget cleanup error:", err);
                }
                widgetRef.current = null;
            }
        };
    }, [currentSymbol, timeframe]);

    return (
        <div className="tradingview-container">
            <div
                ref={containerRef}
                key={`${currentSymbol}-${timeframe}`}
                style={{ height: '100%', width: '100%' }}
            />
        </div>
    );
}

export default TradingViewChart;
