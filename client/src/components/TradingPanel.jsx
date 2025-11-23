import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import './TradingPanel.css';

function TradingPanel({ currentPrice }) {
    const [orderType, setOrderType] = useState('market'); // market or limit
    const [side, setSide] = useState('buy'); // buy or sell
    const [amount, setAmount] = useState('0.001');
    const [limitPrice, setLimitPrice] = useState(currentPrice.toString());

    const calculateTotal = () => {
        const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice);
        return (parseFloat(amount) * price).toFixed(2);
    };

    const handleOrder = () => {
        console.log('Order placed:', {
            side,
            orderType,
            amount,
            price: orderType === 'market' ? currentPrice : limitPrice
        });
        // TODO: Integrate with backend trading API
    };

    return (
        <div className="trading-panel">
            <div className="panel-header">
                <div className="panel-title">Trade BTC/USD</div>
            </div>

            <div className="order-tabs">
                <button
                    className={`tab ${orderType === 'market' ? 'active' : ''}`}
                    onClick={() => setOrderType('market')}
                >
                    Market
                </button>
                <button
                    className={`tab ${orderType === 'limit' ? 'active' : ''}`}
                    onClick={() => setOrderType('limit')}
                >
                    Limit
                </button>
            </div>

            <div className="side-selector">
                <button
                    className={`side-btn buy ${side === 'buy' ? 'active' : ''}`}
                    onClick={() => setSide('buy')}
                >
                    <ArrowUp size={16} />
                    Buy
                </button>
                <button
                    className={`side-btn sell ${side === 'sell' ? 'active' : ''}`}
                    onClick={() => setSide('sell')}
                >
                    <ArrowDown size={16} />
                    Sell
                </button>
            </div>

            <div className="order-form">
                {orderType === 'limit' && (
                    <div className="form-group">
                        <label>Price (USD)</label>
                        <input
                            type="number"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            className="form-input"
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>Amount (BTC)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="form-input"
                        step="0.001"
                    />
                </div>

                <div className="order-summary">
                    <div className="summary-row">
                        <span>Price</span>
                        <span className="value">
                            ${orderType === 'market' ? currentPrice.toLocaleString() : parseFloat(limitPrice).toLocaleString()}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span>Amount</span>
                        <span className="value">{amount} BTC</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span className="value">${parseFloat(calculateTotal()).toLocaleString()}</span>
                    </div>
                </div>

                <button
                    className={`order-btn ${side}`}
                    onClick={handleOrder}
                >
                    {side === 'buy' ? 'Buy BTC' : 'Sell BTC'}
                </button>
            </div>

            <div className="quick-amounts">
                <span className="quick-label">Quick:</span>
                {['25%', '50%', '75%', '100%'].map(percent => (
                    <button
                        key={percent}
                        className="quick-btn"
                        onClick={() => {
                            // Demo: Set random amounts for demonstration
                            const amounts = { '25%': '0.001', '50%': '0.005', '75%': '0.01', '100%': '0.05' };
                            setAmount(amounts[percent]);
                        }}
                    >
                        {percent}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default TradingPanel;
