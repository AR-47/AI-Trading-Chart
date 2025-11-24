import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import AnalysisChart from './AnalysisChart';
import './TradingViewChart.css';

function TradingViewChart({ currentSymbol, timeframe, prediction }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const predictionLineRef = useRef(null);
    const predictionZoneRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [legendData, setLegendData] = useState(null);
    const [viewMode, setViewMode] = useState('AI'); // 'AI' or 'ANALYSIS'

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

            // Set initial legend data to the latest candle
            if (candlestickData.length > 0) {
                const lastCandle = candlestickData[candlestickData.length - 1];
                const lastVolume = volumeData[volumeData.length - 1];
                setLegendData({
                    open: lastCandle.open,
                    high: lastCandle.high,
                    low: lastCandle.low,
                    close: lastCandle.close,
                    volume: lastVolume ? lastVolume.value : 0,
                    color: lastCandle.close >= lastCandle.open ? '#00E676' : '#FF1744'
                });
            }

            return { candlestickData, volumeData };
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setIsLoading(false);
            return { candlestickData: [], volumeData: [] };
        }
    };

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current || viewMode === 'ANALYSIS') return;

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

        // Subscribe to crosshair move
        chart.subscribeCrosshairMove(param => {
            if (
                param.point === undefined ||
                !param.time ||
                param.point.x < 0 ||
                param.point.x > chartContainerRef.current.clientWidth ||
                param.point.y < 0 ||
                param.point.y > chartContainerRef.current.clientHeight
            ) {
                return;
            }

            const candle = param.seriesData.get(candlestickSeries);
            const volume = param.seriesData.get(volumeSeries);

            if (candle) {
                setLegendData({
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                    volume: volume ? volume.value : 0,
                    color: candle.close >= candle.open ? '#00E676' : '#FF1744'
                });
            }
        });

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
    }, [viewMode]); // Re-run when viewMode changes

    // Load data when symbol or timeframe changes
    useEffect(() => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current || viewMode === 'ANALYSIS') return;

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
    }, [currentSymbol, timeframe, viewMode]);

    // Add prediction overlay with zone
    useEffect(() => {
        if (viewMode === 'ANALYSIS') {
            predictionLineRef.current = null;
            predictionZoneRef.current = null;
            return;
        }

        if (!chartRef.current || !candlestickSeriesRef.current || !prediction || !prediction.predicted_price) {
            if (candlestickSeriesRef.current && predictionLineRef.current) {
                try {
                    candlestickSeriesRef.current.removePriceLine(predictionLineRef.current);
                } catch (e) { }
                predictionLineRef.current = null;
            }
            if (chartRef.current && predictionZoneRef.current) {
                try {
                    chartRef.current.removeSeries(predictionZoneRef.current);
                } catch (e) { }
                predictionZoneRef.current = null;
            }
            return;
        }

        const predictedPrice = prediction.predicted_price;
        const currentPrice = prediction.current_price || predictedPrice;
        const isBullish = predictedPrice > currentPrice;

        // Remove old overlays
        if (predictionLineRef.current) {
            try {
                candlestickSeriesRef.current.removePriceLine(predictionLineRef.current);
            } catch (e) { }
        }
        if (predictionZoneRef.current) {
            try {
                chartRef.current.removeSeries(predictionZoneRef.current);
            } catch (e) { }
        }

        // Add simple prediction zone (background shading)
        const currentTime = Math.floor(Date.now() / 1000);
        const futureTime = currentTime + (30 * 24 * 60 * 60); // 30 days ahead

        const zoneUpper = Math.max(currentPrice, predictedPrice) * 1.02;
        const zoneLower = Math.min(currentPrice, predictedPrice) * 0.98;

        const zoneSeries = chartRef.current.addLineSeries({
            color: isBullish ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)',
            lineWidth: 0,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
        });

        zoneSeries.setData([
            { time: currentTime, value: zoneUpper },
            { time: futureTime, value: zoneUpper }
        ]);

        // Add prediction line
        const priceLine = candlestickSeriesRef.current.createPriceLine({
            price: predictedPrice,
            color: isBullish ? '#00E676' : '#FF1744',
            lineWidth: 2,
            lineStyle: 0,
            axisLabelVisible: true,
            title: `AI: $${predictedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        });

        predictionZoneRef.current = zoneSeries;
        predictionLineRef.current = priceLine;
    }, [prediction, viewMode]);

    return (
        <div className="chart-wrapper">
            <div className="chart-header">
                <div className="chart-title-group">
                    <div className="chart-title">
                        <span className="symbol-name">{currentSymbol.replace('USDT', '/USDT')}</span>
                        <span className="timeframe-badge">{timeframe}</span>
                    </div>
                    {viewMode === 'AI' && legendData && (
                        <div className="chart-legend">
                            <span className="legend-item">O <span className="legend-value" style={{ color: legendData.color }}>{legendData.open.toFixed(2)}</span></span>
                            <span className="legend-item">H <span className="legend-value" style={{ color: legendData.color }}>{legendData.high.toFixed(2)}</span></span>
                            <span className="legend-item">L <span className="legend-value" style={{ color: legendData.color }}>{legendData.low.toFixed(2)}</span></span>
                            <span className="legend-item">C <span className="legend-value" style={{ color: legendData.color }}>{legendData.close.toFixed(2)}</span></span>
                            <span className="legend-item">Vol <span className="legend-value" style={{ color: legendData.color }}>{(legendData.volume / 1000).toFixed(2)}K</span></span>
                        </div>
                    )}
                </div>

                <div className="chart-controls">
                    <div className="mode-toggle">
                        <button
                            className={`mode-btn ${viewMode === 'AI' ? 'active' : ''}`}
                            onClick={() => setViewMode('AI')}
                        >
                            🤖 AI
                        </button>
                        <button
                            className={`mode-btn ${viewMode === 'ANALYSIS' ? 'active' : ''}`}
                            onClick={() => setViewMode('ANALYSIS')}
                        >
                            📉 Analysis
                        </button>
                    </div>

                    {viewMode === 'AI' && prediction && (
                        <div className="chart-prediction-info">
                            <span className="prediction-label">AI Target:</span>
                            <span className={`prediction-value ${prediction.predicted_price > prediction.current_price ? 'bullish' : 'bearish'}`}>
                                ${prediction.predicted_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="tradingview-container">
                {viewMode === 'AI' ? (
                    <>
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
                    </>
                ) : (
                    <AnalysisChart symbol={currentSymbol} />
                )}
            </div>
        </div>
    );
}

export default TradingViewChart;
