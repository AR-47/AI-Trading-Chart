import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Brain, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
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

                        {/* Seasonals Section */}
                        <div className="seasonals-section">
                            <div className="section-header">
                                <Clock size={14} />
                                <span>Seasonals</span>
                            </div>
                            <div className="seasonals-chart">
                                <ResponsiveContainer width="100%" height={120}>
                                    <LineChart data={[
                                        { month: 'Jan', y23: 40, y24: 65, y25: 45 },
                                        { month: 'Feb', y23: 45, y24: 70, y25: 52 },
                                        { month: 'Mar', y23: 35, y24: 60, y25: 48 },
                                        { month: 'Apr', y23: 50, y24: 75, y25: 60 },
                                        { month: 'May', y23: 55, y24: 68, y25: 58 },
                                        { month: 'Jun', y23: 48, y24: 72, y25: 65 },
                                    ]}>
                                        <XAxis dataKey="month" hide />
                                        <YAxis hide domain={['dataMin', 'dataMax']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1E222D', border: 'none', fontSize: '12px' }}
                                            itemStyle={{ fontSize: '12px' }}
                                        />
                                        <Line type="monotone" dataKey="y23" stroke="#F7B500" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="y24" stroke="#089981" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="y25" stroke="#2962FF" strokeWidth={2} dot={true} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="chart-legend">
                                    <span style={{ color: '#2962FF' }}>● 2025</span>
                                    <span style={{ color: '#089981' }}>● 2024</span>
                                    <span style={{ color: '#F7B500' }}>● 2023</span>
                                </div>
                            </div>
                        </div>

                        {/* Technicals Section */}
                        <div className="technicals-section">
                            <div className="section-header">
                                <Activity size={14} />
                                <span>Technicals</span>
                            </div>
                            <div className="technicals-gauge-container">
                                <div className="gauge-labels">
                                    <span className="sell">Sell</span>
                                    <span className="neutral">Neutral</span>
                                    <span className="buy">Buy</span>
                                </div>
                                <div className="gauge-wrapper">
                                    <svg viewBox="0 0 200 100" className="gauge-svg">
                                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2A2E39" strokeWidth="12" />
                                        <path
                                            d="M 20 100 A 80 80 0 0 1 180 100"
                                            fill="none"
                                            stroke="url(#gaugeGradient)"
                                            strokeWidth="12"
                                            strokeDasharray="251.2"
                                            strokeDashoffset={251.2 * (1 - (prediction.confidence || 0.5))}
                                            className="gauge-fill"
                                        />
                                        <defs>
                                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#F23645" />
                                                <stop offset="50%" stopColor="#F7B500" />
                                                <stop offset="100%" stopColor="#089981" />
                                            </linearGradient>
                                        </defs>
                                        {/* Needle */}
                                        <line
                                            x1="100"
                                            y1="100"
                                            x2="100"
                                            y2="30"
                                            stroke="#D1D4DC"
                                            strokeWidth="4"
                                            transform={`rotate(${(prediction.confidence || 0.5) * 180 - 90} 100 100)`}
                                            style={{ transition: 'transform 1s ease-out' }}
                                        />
                                        <circle cx="100" cy="100" r="6" fill="#D1D4DC" />
                                    </svg>
                                </div>
                                <div className="technicals-status">
                                    {prediction.confidence > 0.6 ? 'Strong Buy' : prediction.confidence < 0.4 ? 'Strong Sell' : 'Neutral'}
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
