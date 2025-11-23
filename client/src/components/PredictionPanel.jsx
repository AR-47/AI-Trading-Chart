import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Brain, Clock } from 'lucide-react';
import './PredictionPanel.css';

function PredictionPanel({ prediction, loading, currentPrice, currentSymbol, onTimeframeChange, onSymbolChange }) {
    const [timeframe, setTimeframe] = useState('1d');

    const timeframeOptions = [
        { value: '30m', label: '30 Min' },
        { value: '1h', label: '1 Hour' },
        { value: '4h', label: '4 Hours' },
        { value: '1d', label: '1 Day' },
        { value: '1w', label: '1 Week' },
        { value: '1M', label: '1 Month' }
    ];

    const cryptoOptions = [
        { value: 'BTCUSDT', label: 'Bitcoin (BTC)', icon: '₿' },
        { value: 'ETHUSDT', label: 'Ethereum (ETH)', icon: 'Ξ' },
        { value: 'BNBUSDT', label: 'Binance Coin (BNB)', icon: 'BNB' },
        { value: 'SOLUSDT', label: 'Solana (SOL)', icon: 'SOL' },
        { value: 'ADAUSDT', label: 'Cardano (ADA)', icon: 'ADA' },
        { value: 'XRPUSDT', label: 'Ripple (XRP)', icon: 'XRP' },
        { value: 'DOTUSDT', label: 'Polkadot (DOT)', icon: 'DOT' },
        { value: 'DOGEUSDT', label: 'Dogecoin (DOGE)', icon: 'Ð' },
        { value: 'AVAXUSDT', label: 'Avalanche (AVAX)', icon: 'AVAX' },
        { value: 'POLUSDT', label: 'Polygon (MATIC)', icon: 'POL' }
    ];

    const getTimeframeLabel = () => {
        const option = timeframeOptions.find(opt => opt.value === timeframe);
        return option ? option.label : '1 Day';
    };

    const handleTimeframeSelect = (newTimeframe) => {
        setTimeframe(newTimeframe);
        if (onTimeframeChange) {
            onTimeframeChange(newTimeframe);
        }
    };

    const getPredictionTrend = () => {
        if (!prediction) return null;
        const change = prediction.predicted_price - currentPrice;
        const changePercent = (change / currentPrice) * 100;
        return {
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            isPositive: change > 0
        };
    };

    const trend = getPredictionTrend();

    return (
        <div className="prediction-panel">
            <div className="panel-header">
                <div className="panel-title">
                    <Brain size={18} />
                    <span>AI Price Prediction</span>
                </div>
                <div className="status-badge">
                    {loading ? (
                        <span className="status-loading">Analyzing...</span>
                    ) : (
                        <span className="status-active">
                            <div className="pulse-dot" />
                            Live
                        </span>
                    )}
                </div>
            </div>

            <div className="symbol-selector">
                <Activity size={14} />
                <span className="selector-label">Cryptocurrency:</span>
                <select
                    value={currentSymbol}
                    onChange={(e) => onSymbolChange && onSymbolChange(e.target.value)}
                    className="symbol-dropdown"
                >
                    {cryptoOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="timeframe-selector">
                <Clock size={14} />
                <span className="selector-label">Timeframe:</span>
                <select
                    value={timeframe}
                    onChange={(e) => handleTimeframeSelect(e.target.value)}
                    className="timeframe-dropdown"
                >
                    {timeframeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="prediction-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Processing market data...</p>
                    </div>
                ) : prediction ? (
                    <>
                        <div className="current-price-section">
                            <label>Current Price</label>
                            <div className="price-display">
                                ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        <div className="prediction-arrow">→</div>

                        <div className="predicted-price-section">
                            <label>{getTimeframeLabel()} Prediction</label>
                            <div className={`price-display ${trend?.isPositive ? 'positive' : 'negative'}`}>
                                ${prediction.predicted_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {trend && (
                                <div className={`change-indicator ${trend.isPositive ? 'positive' : 'negative'}`}>
                                    {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    <span>{trend.isPositive ? '+' : ''}{trend.change} ({trend.changePercent}%)</span>
                                </div>
                            )}
                        </div>

                        <div className="metrics-grid">
                            <div className="metric">
                                <label>Confidence</label>
                                <div className="metric-value">
                                    <div className="confidence-bar">
                                        <div
                                            className="confidence-fill"
                                            style={{ width: `${(prediction.confidence || 85) * 100}%` }}
                                        />
                                    </div>
                                    <span>{((prediction.confidence || 0.85) * 100).toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="metric">
                                <label>Model Accuracy</label>
                                <div className="metric-value highlight">
                                    {(prediction.accuracy || 0.92).toFixed(2)}%
                                </div>
                            </div>

                            <div className="metric">
                                <label>Last Updated</label>
                                <div className="metric-value">
                                    {prediction.timestamp ? new Date(prediction.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) : 'Just now'}
                                </div>
                            </div>
                        </div>

                        <div className="analysis-note">
                            <Activity size={14} />
                            <span>
                                {trend?.isPositive
                                    ? `Model suggests bullish momentum in the next ${getTimeframeLabel().toLowerCase()}`
                                    : `Model indicates potential pullback in the next ${getTimeframeLabel().toLowerCase()}`
                                }
                            </span>
                        </div>

                        {/* Market Sentiment Section */}
                        <div className="sentiment-section">
                            <div className="section-header">
                                <TrendingUp size={14} />
                                <span>Market Sentiment</span>
                            </div>
                            <div className="sentiment-gauge">
                                <div className="sentiment-label">
                                    {trend?.isPositive ? 'Bullish' : 'Bearish'}
                                </div>
                                <div className="sentiment-bar-container">
                                    <div
                                        className={`sentiment-bar ${trend?.isPositive ? 'bullish' : 'bearish'}`}
                                        style={{ width: `${Math.min(Math.abs(parseFloat(trend?.changePercent || 0)) * 20 + 50, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Key Drivers Section */}
                        <div className="drivers-section">
                            <div className="section-header">
                                <Activity size={14} />
                                <span>Key Drivers</span>
                            </div>
                            <div className="drivers-list">
                                <div className="driver-item">
                                    <span className="driver-name">Volume</span>
                                    <span className="driver-value positive">High</span>
                                </div>
                                <div className="driver-item">
                                    <span className="driver-name">Trend Strength</span>
                                    <span className={`driver-value ${trend?.isPositive ? 'positive' : 'negative'}`}>
                                        {trend?.isPositive ? 'Strong Buy' : 'Strong Sell'}
                                    </span>
                                </div>
                                <div className="driver-item">
                                    <span className="driver-name">Volatility</span>
                                    <span className="driver-value warning">Moderate</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="error-state">
                        <p>⚠️ Unable to load prediction</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PredictionPanel;
