import React, { useEffect, useState } from 'react';
import { Brain, Zap, BarChart2, TrendingUp, Activity } from 'lucide-react';
import './FeatureImportance.css';

function FeatureImportance({ trend }) {
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        // Mock data generation based on trend
        // In a real app, this would come from the API
        const isBullish = trend?.isPositive;

        const mockFeatures = [
            {
                name: 'Volume Momentum',
                impact: 85,
                isPositive: isBullish, // Volume supports the trend
                icon: <BarChart2 size={14} />
            },
            {
                name: 'Market Sentiment',
                impact: 72,
                isPositive: isBullish, // Sentiment aligns with trend
                icon: <Zap size={14} />
            },
            {
                name: 'RSI Divergence',
                impact: 45,
                isPositive: !isBullish, // RSI might be showing overbought/oversold
                icon: <Activity size={14} />
            },
            {
                name: 'Moving Averages',
                impact: 60,
                isPositive: isBullish,
                icon: <TrendingUp size={14} />
            }
        ];

        // Sort by impact
        setFeatures(mockFeatures.sort((a, b) => b.impact - a.impact));
    }, [trend]);

    return (
        <div className="feature-importance-container">
            <div className="feature-header">
                <Brain size={16} />
                <span>AI Analysis: Key Drivers</span>
            </div>

            <div className="feature-list">
                {features.map((feature, index) => (
                    <div key={index} className="feature-item" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="feature-info">
                            <div className="feature-name-container" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: feature.isPositive ? '#00E676' : '#FF1744', opacity: 0.8 }}>
                                    {feature.icon}
                                </span>
                                <span className="feature-name">{feature.name}</span>
                            </div>
                            <span className={`feature-impact ${feature.isPositive ? 'positive' : 'negative'}`}>
                                {feature.isPositive ? '+' : '-'}{feature.impact}%
                            </span>
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className={`progress-bar ${feature.isPositive ? 'positive' : 'negative'}`}
                                style={{ width: `${feature.impact}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="analysis-summary">
                <h4>AI Reasoning</h4>
                <p>
                    The model predicts a <strong className={trend?.isPositive ? 'positive' : 'negative'}>{trend?.isPositive ? "BULLISH" : "BEARISH"}</strong> trend.
                    This is primarily driven by <strong>{features[0]?.name}</strong>, indicating {trend?.isPositive ? "strong accumulation" : "distribution"} at current levels.
                    {features[1]?.isPositive === trend?.isPositive
                        ? ` Additionally, ${features[1]?.name} confirms this momentum.`
                        : ` However, ${features[1]?.name} suggests some caution as it diverges from the main trend.`}
                </p>
            </div>
        </div>
    );
}

export default FeatureImportance;
