import React from 'react';
import { Menu, Search, Plus, TrendingUp, Bell, BarChart2, Clock } from 'lucide-react';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="header-left">
                <button className="icon-btn">
                    <Menu size={20} />
                </button>
                <div className="symbol-selector">
                    <Search size={16} className="search-icon" />
                    <span className="symbol-text">BTCUSD</span>
                </div>
                <button className="icon-btn">
                    <Plus size={20} />
                </button>
                <div className="timeframe-btn active">D</div>
            </div>

            <div className="header-center">
                <button className="header-btn">
                    <BarChart2 size={16} />
                    <span>Indicators</span>
                </button>
                <button className="header-btn">
                    <TrendingUp size={16} />
                    <span>Strategies</span>
                </button>
                <button className="header-btn">
                    <Bell size={16} />
                    <span>Alert</span>
                </button>
                <button className="header-btn">
                    <Clock size={16} />
                    <span>Replay</span>
                </button>
            </div>

            <div className="header-right">
                <div className="ai-badge">
                    <span className="ai-icon">🤖</span>
                    <span>AI Predictions</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
