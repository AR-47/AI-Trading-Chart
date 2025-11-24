"""
Real Backtesting Engine
Uses actual historical data and model predictions to calculate real performance
"""
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
import joblib
import os


MODEL_PATH = 'models/market_model.h5'
SCALER_PATH = 'models/market_scaler.pkl'
DATA_PATH = 'data/BTC_USD.csv'


def load_backtest_components():
    """Load model, scaler, and data"""
    model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    df = pd.read_csv(DATA_PATH)
    df = df.sort_values('Date').reset_index(drop=True)
    return model, scaler, df


def run_backtest(days=30, initial_capital=10000):
    """
    Run real backtest using historical data and model predictions
    
    Args:
        days: Number of days to backtest
        initial_capital: Starting capital in USD
    
    Returns:
        dict with equity_curve, metrics
    """
    try:
        model, scaler, df = load_backtest_components()
        
        # Get the last N days of data
        sequence_length = 60
        total_needed = days + sequence_length
        
        if len(df) < total_needed:
            return {'error': 'Not enough historical data'}
        
        # Start from the point where we have enough history
        backtest_df = df.tail(total_needed).reset_index(drop=True)
        
        results = []
        capital = initial_capital
        position = 0  # 0 = no position, 1 = long
        wins = 0
        losses = 0
        trades = []
        
        # Run backtest day by day
        for i in range(sequence_length, len(backtest_df) - 1):
            # Get sequence for prediction
            sequence = backtest_df[['BTC_Close', 'BTC_Volume']].iloc[i-sequence_length:i].values
            scaled_sequence = scaler.transform(sequence)
            X = scaled_sequence.reshape(1, sequence_length, 2)
            
            # Make prediction
            scaled_pred = model.predict(X, verbose=0)
            dummy_pred = np.zeros((1, 2))
            dummy_pred[:, 0] = scaled_pred.flatten()
            predicted_price = scaler.inverse_transform(dummy_pred)[0][0]
            
            current_price = backtest_df['BTC_Close'].iloc[i]
            next_day_actual = backtest_df['BTC_Close'].iloc[i + 1]
            
            # Trading logic: Buy if predicted price > current price
            predicted_return = (predicted_price - current_price) / current_price
            
            # Enter long if prediction is bullish and we're not in a position
            if predicted_return > 0.005 and position == 0:  # 0.5% threshold
                position = 1
                entry_price = current_price
                entry_date = backtest_df['Date'].iloc[i]
            
            # Exit if we're in a position
            elif position == 1:
                actual_return = (next_day_actual - entry_price) / entry_price
                trade_pnl = capital * actual_return
                capital += trade_pnl
                
                if actual_return > 0:
                    wins += 1
                else:
                    losses += 1
                
                trades.append({
                    'entry': entry_price,
                    'exit': next_day_actual,
                    'return': actual_return,
                    'pnl': trade_pnl
                })
                
                position = 0
            
            # Record equity
            current_equity = capital
            results.append({
                'date': backtest_df['Date'].iloc[i],
                'equity': current_equity,
                'price': current_price
            })
        
        # Close any open position at the end
        if position == 1:
            final_price = backtest_df['BTC_Close'].iloc[-1]
            actual_return = (final_price - entry_price) / entry_price
            trade_pnl = capital * actual_return
            capital += trade_pnl
            
            if actual_return > 0:
                wins += 1
            else:
                losses += 1
        
        # Calculate metrics
        total_return = ((capital - initial_capital) / initial_capital) * 100
        win_rate = (wins / (wins + losses) * 100) if (wins + losses) > 0 else 0
        
        # Calculate max drawdown
        equity_curve = [r['equity'] for r in results]
        peak = equity_curve[0]
        max_dd = 0
        for equity in equity_curve:
            if equity > peak:
                peak = equity
            dd = ((peak - equity) / peak) * 100
            if dd > max_dd:
                max_dd = dd
        
        # Calculate profit factor
        gross_wins = sum([t['pnl'] for t in trades if t['pnl'] > 0]) if trades else 0
        gross_losses = abs(sum([t['pnl'] for t in trades if t['pnl'] < 0])) if trades else 1
        profit_factor = gross_wins / gross_losses if gross_losses > 0 else 0
        
        return {
            'equity_curve': results,
            'final_capital': capital,
            'total_return': total_return,
            'win_rate': win_rate,
            'max_drawdown': max_dd,
            'profit_factor': profit_factor,
            'total_trades': wins + losses,
            'wins': wins,
            'losses': losses
        }
        
    except Exception as e:
        print(f"Backtest error: {e}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}


if __name__ == '__main__':
    print("Running real backtest...")
    result = run_backtest(days=30)
    if 'error' in result:
        print(f"Error: {result['error']}")
    else:
        print(f"Total Return: {result['total_return']:.2f}%")
        print(f"Win Rate: {result['win_rate']:.2f}%")
        print(f"Max Drawdown: {result['max_drawdown']:.2f}%")
        print(f"Profit Factor: {result['profit_factor']:.2f}")
        print(f"Total Trades: {result['total_trades']}")
