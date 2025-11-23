import React, { useState, useEffect, useCallback } from 'react';
import TradingViewChart from './components/TradingViewChart';
import PredictionPanel from './components/PredictionPanel';
import './App.css';

function App() {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(86243.78);
    const [timeframe, setTimeframe] = useState('1d');
    const [currentSymbol, setCurrentSymbol] = useState('BTCUSDT');

    // Fetch live price for any cryptocurrency from Binance API
    const fetchLivePrice = useCallback(async (symbol) => {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
            const data = await response.json();
            setCurrentPrice(parseFloat(data.price));
        } catch (error) {
            console.error('Error fetching live price:', error);
        }
    }, []);

    // Fetch prediction from backend with timeframe and symbol
    const fetchPrediction = useCallback(async (selectedTimeframe, symbol) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/predict?timeframe=${selectedTimeframe}&symbol=${symbol}`);
            const data = await response.json();
            setPrediction(data);
        } catch (error) {
            console.error('Error fetching prediction:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle timeframe change
    const handleTimeframeChange = useCallback((newTimeframe) => {
        setTimeframe(newTimeframe);
        fetchPrediction(newTimeframe, currentSymbol);
    }, [fetchPrediction, currentSymbol]);

    // Handle symbol change
    const handleSymbolChange = useCallback((newSymbol) => {
        console.log('Symbol changed to:', newSymbol);
        setCurrentSymbol(newSymbol);
        fetchLivePrice(newSymbol);
        fetchPrediction(timeframe, newSymbol);
    }, [fetchLivePrice, fetchPrediction, timeframe]);

    useEffect(() => {
        // Initial fetch
        fetchLivePrice(currentSymbol);
        fetchPrediction(timeframe, currentSymbol);

        // Update live price every 1 second
        const priceInterval = setInterval(() => fetchLivePrice(currentSymbol), 1000);

        // Refresh prediction every 5 minutes
        const predictionInterval = setInterval(() => fetchPrediction(timeframe, currentSymbol), 5 * 60 * 1000);

        return () => {
            clearInterval(priceInterval);
            clearInterval(predictionInterval);
        };
    }, [currentSymbol, timeframe, fetchLivePrice, fetchPrediction]);

    return (
        <div className="app">
            <div className="main-content">
                <div className="chart-section">
                    <TradingViewChart
                        currentSymbol={currentSymbol}
                        timeframe={timeframe}
                        prediction={prediction}
                    />
                </div>
                <div className="side-panels">
                    <PredictionPanel
                        prediction={prediction}
                        loading={loading}
                        currentPrice={currentPrice}
                        currentSymbol={currentSymbol}
                        onTimeframeChange={handleTimeframeChange}
                        onSymbolChange={handleSymbolChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
