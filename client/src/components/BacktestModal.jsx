import React, { useState } from 'react';
import { X, TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './BacktestModal.css';

function BacktestModal({ onClose }) {
    const [backtestData, setBacktestData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runBacktest = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/backtest?days=30&capital=10000');
            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setBacktestData(data);
            }
        } catch (err) {
            setError('Failed to run backtest');
        } finally {
            setLoading(false);
        }
    };

    // Auto-run on mount
    React.useEffect(() => {
        runBacktest();
    }, []);

    const formatCurrency = (value) => {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="backtest-modal-overlay" onClick={onClose}>
            <div className="backtest-modal-content" onClick={e => e.stopPropagation()}>
                <div className="backtest-modal-header">
                    <h2>Strategy Backtest Results</h2>
                    <button className="backtest-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {loading && (
                    <div className="backtest-loading">
                        <div className="backtest-spinner"></div>
                        <p>Running real backtest on historical data...</p>
                    </div>
                )}

                {error && (
                    <div className="backtest-error">
                        <AlertTriangle size={24} />
                        <p>{error}</p>
                    </div>
                )}

                {backtestData && !loading && !error && (
                    <>
                        <div className="backtest-metrics-grid">
                            <div className="backtest-metric">
                                <div className="metric-icon green">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Total Return</span>
                                    <span className={`metric-value ${backtestData.total_return >= 0 ? 'positive' : 'negative'}`}>
                                        {backtestData.total_return >= 0 ? '+' : ''}{backtestData.total_return.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <div className="backtest-metric">
                                <div className="metric-icon blue">
                                    <Target size={20} />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Win Rate</span>
                                    <span className="metric-value">{backtestData.win_rate.toFixed(1)}%</span>
                                </div>
                            </div>

                            <div className="backtest-metric">
                                <div className="metric-icon yellow">
                                    <Award size={20} />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Profit Factor</span>
                                    <span className="metric-value">{backtestData.profit_factor.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="backtest-metric">
                                <div className="metric-icon red">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Max Drawdown</span>
                                    <span className="metric-value negative">-{backtestData.max_drawdown.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="backtest-chart-section">
                            <h3>Equity Curve (Last 30 Days)</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={backtestData.equity_curve}>
                                    <defs>
                                        <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="rgba(255, 255, 255, 0.5)"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(date) => {
                                            const d = new Date(date);
                                            return `${d.getMonth() + 1}/${d.getDate()}`;
                                        }}
                                    />
                                    <YAxis
                                        stroke="rgba(255, 255, 255, 0.5)"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(19, 23, 34, 0.95)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px'
                                        }}
                                        formatter={(value) => [formatCurrency(value), 'Equity']}
                                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="equity"
                                        stroke="#00E676"
                                        strokeWidth={2}
                                        fill="url(#equityGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="backtest-summary">
                            <p>
                                Started with <strong>{formatCurrency(10000)}</strong> •
                                Ended with <strong>{formatCurrency(backtestData.final_capital)}</strong> •
                                <strong> {backtestData.total_trades}</strong> trades ({backtestData.wins}W / {backtestData.losses}L)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default BacktestModal;
