import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './TradingViewChart.css';

function TradingViewChart({ currentSymbol, timeframe, prediction }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const predictionLineRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    // Map timeframes to Binance intervals
    const getInterval = (tf) => {
        const map = {
            '30m': '30m',
            '1h': '1h',
            '4h': '4h',
            '1d': '1d',
            '1w': '1w',
            '1M': '1M'
        };
        return map[tf] || '1d';
    };

    // Fetch candlestick data from Binance
    const fetchChartData = async (symbol, interval) => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=300`
            );
            const data = await response.json();

            // Parse Binance data: [time, open, high, low, close, volume, ...]
            const candlestickData = data.map(item => ({
                time: item[0] / 1000, // Convert to seconds
                open: parseFloat(item[1]),
                high: parseFloat(item[2]),
                low: parseFloat(item[3]),
                close: parseFloat(item[4])
            }));

            const volumeData = data.map(item => ({
                time: item[0] / 1000,
                value: parseFloat(item[5]),
                color: parseFloat(item[4]) >= parseFloat(item[1])
                    ? 'rgba(0, 230, 118, 0.4)' // Green volume for up candles
                    : 'rgba(255, 23, 68, 0.4)'  // Red volume for down candles
            }));

            setIsLoading(false);
            return { candlestickData, volumeData };
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setIsLoading(false);
            return { candlestickData: [], volumeData: [] };
        }
    };

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart instance
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: '#131722' },
                textColor: '#D9D9D9',
            },
            grid: {
                vertLines: { color: '#1E222D' },
                horzLines: { color: '#1E222D' },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    width: 1,
                    color: 'rgba(224, 227, 235, 0.1)',
                    style: 0,
                },
                horzLine: {
                    color: 'rgba(224, 227, 235, 0.1)',
                    labelBackgroundColor: '#2962FF',
                },
            },
            rightPriceScale: {
                borderColor: '#2B2B43',
                scaleMargins: {
                    top: 0.05,
                    bottom: 0.08,  // Only 8% space for volume at bottom
                },
            },
            timeScale: {
                borderColor: '#2B2B43',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#00E676',
            downColor: '#FF1744',
            borderUpColor: '#00E676',
            borderDownColor: '#FF1744',
            wickUpColor: '#00E676',
            wickDownColor: '#FF1744',
        });

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: 'volume',
            scaleMargins: {
                top: 0.92,  // Start at 92%, use bottom 8% space
                bottom: 0,
            },
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []);

    // Load data when symbol or timeframe changes
    useEffect(() => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

        const interval = getInterval(timeframe);

        fetchChartData(currentSymbol, interval).then(({ candlestickData, volumeData }) => {
            if (candlestickData.length > 0) {
                candlestickSeriesRef.current.setData(candlestickData);
                volumeSeriesRef.current.setData(volumeData);

                // Fit content to view
                if (chartRef.current) {
                    chartRef.current.timeScale().fitContent();
                }
            }
        });
    }, [currentSymbol, timeframe]);

    // Add prediction overlay
    useEffect(() => {
        if (!chartRef.current || !candlestickSeriesRef.current || !prediction || !prediction.predicted_price) {
            // Remove existing line if prediction is gone
            if (predictionLineRef.current) {
                candlestickSeriesRef.current.removePriceLine(predictionLineRef.current);
                predictionLineRef.current = null;
            }
            return;
        }

        const predictedPrice = prediction.predicted_price;
        const currentPrice = prediction.current_price || predictedPrice;
        const isBullish = predictedPrice > currentPrice;

        // Remove old line
        if (predictionLineRef.current) {
            candlestickSeriesRef.current.removePriceLine(predictionLineRef.current);
        }

        // Add new prediction line
        const priceLine = candlestickSeriesRef.current.createPriceLine({
            price: predictedPrice,
            color: isBullish ? '#00E676' : '#FF1744',
            lineWidth: 2,
            lineStyle: 0, // Solid
            axisLabelVisible: true,
            title: `AI: $${predictedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        });

        predictionLineRef.current = priceLine;
    }, [prediction]);

    return (
        <div className="chart-wrapper">
            <div className="chart-header">
                <div className="chart-title">
                    <span className="symbol-name">{currentSymbol.replace('USDT', '/USDT')}</span>
                    <span className="timeframe-badge">{timeframe}</span>
                </div>
                {prediction && (
                    <div className="chart-prediction-info">
                        <span className="prediction-label">AI Target:</span>
                        <span className={`prediction-value ${prediction.predicted_price > prediction.current_price ? 'bullish' : 'bearish'}`}>
                            ${prediction.predicted_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
            </div>
            <div className="tradingview-container">
                {isLoading && (
                    <div className="chart-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading chart data...</p>
                    </div>
                )}
                <div
                    ref={chartContainerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        visibility: isLoading ? 'hidden' : 'visible'
                    }}
                />
            </div>
        </div>
    );
}

export default TradingViewChart;
