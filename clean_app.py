import streamlit as st
from streamlit_lightweight_charts import renderLightweightCharts
import pandas as pd
import numpy as np
import datetime

# -----------------------------------------------------------------------------
# 1. PAGE CONFIGURATION (Must be first)
# -----------------------------------------------------------------------------
st.set_page_config(
    layout="wide", 
    page_title="TradingView Replica",
    initial_sidebar_state="collapsed"
)

# Initialize Session State for Timeframe
if 'timeframe' not in st.session_state:
    st.session_state.timeframe = '1D'

# -----------------------------------------------------------------------------
# 2. AGGRESSIVE CSS STYLING (The "Clean" Look)
# -----------------------------------------------------------------------------
st.markdown("""
<style>
    /* 1. REMOVE STREAMLIT BRANDING & PADDING */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    .block-container {
        padding-top: 0rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        max-width: 100% !important;
    }
    
    /* 2. REMOVE GAPS */
    div[data-testid="stVerticalBlock"] {
        gap: 0rem;
    }

    /* 3. FORCE WHITE BACKGROUND (Fixes Black Stripe) */
    .stApp {
        background-color: #ffffff !important;
    }
    
    /* 4. CUSTOM TOP BAR STYLING */
    .tv-header {
        background-color: #ffffff;
        border-bottom: 1px solid #e0e3eb;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    }
    
    .tv-symbol-group {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-right: 20px;
    }
    
    .tv-icon {
        width: 28px;
        height: 28px;
        background-color: #f0f3fa;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }
    
    .tv-symbol {
        font-size: 18px;
        font-weight: 600;
        color: #131722;
    }
    
    .tv-exchange {
        font-size: 12px;
        color: #787b86;
        margin-left: 5px;
        font-weight: 400;
        background: #f0f3fa;
        padding: 2px 6px;
        border-radius: 4px;
    }
    
    .tv-price-group {
        display: flex;
        align-items: baseline;
        gap: 10px;
    }
    
    .tv-price {
        font-size: 20px;
        font-weight: 600;
        color: #f23645; /* Red for down */
    }
    
    .tv-change {
        font-size: 14px;
        color: #f23645;
        font-weight: 500;
    }
    
    /* BUTTONS */
    .tv-btn-group {
        margin-left: 20px;
        display: flex;
        gap: 8px;
    }
    
    .tv-btn-sell {
        background-color: #fff2f4;
        color: #f23645;
        border: 1px solid #fff2f4;
        padding: 6px 16px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
    }
    
    .tv-btn-buy {
        background-color: #e8f5e9; /* Light green */
        color: #089981;
        border: 1px solid #e8f5e9;
        padding: 6px 16px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
    }
    
    /* TIMEFRAME TOOLBAR STYLING */
    .stButton button {
        background-color: transparent;
        border: none;
        color: #131722;
        font-weight: 600;
        font-size: 13px;
        padding: 4px 8px;
    }
    .stButton button:hover {
        background-color: #f0f3fa;
        color: #2962ff;
    }
    .stButton button:focus {
        background-color: transparent;
        color: #2962ff;
        border: none;
        box-shadow: none;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 3. DATA & PREDICTION GENERATION
# -----------------------------------------------------------------------------
def generate_data(timeframe):
    # Define parameters based on timeframe
    if timeframe == '1D':
        freq = '5min'
        periods = 288 # 24 hours * 12 (5 min chunks)
        start_date = pd.Timestamp.now() - pd.Timedelta(days=1)
        volatility = 50
    elif timeframe == '5D':
        freq = '30min'
        periods = 240 # 5 days * 48 (30 min chunks)
        start_date = pd.Timestamp.now() - pd.Timedelta(days=5)
        volatility = 100
    elif timeframe == '1M':
        freq = '4H'
        periods = 180 # 30 days * 6
        start_date = pd.Timestamp.now() - pd.Timedelta(days=30)
        volatility = 300
    elif timeframe == '3M':
        freq = '12H'
        periods = 180
        start_date = pd.Timestamp.now() - pd.Timedelta(days=90)
        volatility = 500
    elif timeframe == '6M':
        freq = '1D'
        periods = 180
        start_date = pd.Timestamp.now() - pd.Timedelta(days=180)
        volatility = 800
    elif timeframe == '1Y':
        freq = '1D'
        periods = 365
        start_date = pd.Timestamp.now() - pd.Timedelta(days=365)
        volatility = 1000
    elif timeframe == '5Y':
        freq = '1W'
        periods = 260
        start_date = pd.Timestamp.now() - pd.Timedelta(days=365*5)
        volatility = 2000
    else: # ALL or YTD
        freq = '1D'
        periods = 500
        start_date = pd.Timestamp.now() - pd.Timedelta(days=500)
        volatility = 1000

    dates = pd.date_range(start=start_date, periods=periods, freq=freq)
    prices = [84000]
    
    # Generate random walk
    for i in range(periods-1):
        change = np.random.normal(0, volatility)
        prices.append(max(1000, prices[-1] + change)) # Ensure price doesn't go negative

    df = pd.DataFrame({
        "time": dates,
        "close": prices
    })
    
    # Generate OHLC from Close
    df['open'] = df['close'].shift(1).fillna(prices[0])
    # Add some noise for High/Low
    noise = volatility * 0.5
    df['high'] = df[['open', 'close']].max(axis=1) + np.abs(np.random.normal(0, noise, periods))
    df['low'] = df[['open', 'close']].min(axis=1) - np.abs(np.random.normal(0, noise, periods))
    df['volume'] = np.random.randint(100, 5000, periods)
    
    return df

# Get Data based on Session State
df = generate_data(st.session_state.timeframe)

# Generate "Prediction" Line (The Blue Line)
future_dates = pd.date_range(start=df['time'].iloc[-1], periods=30, freq=pd.infer_freq(df['time']) or 'D')
last_price = df['close'].iloc[-1]
pred_prices = [last_price]
for i in range(29):
    pred_prices.append(pred_prices[-1] + np.random.normal(0, (df['high'].mean() - df['low'].mean())))

# -----------------------------------------------------------------------------
# 4. CUSTOM HTML HEADER (The Secret to the "Look")
# -----------------------------------------------------------------------------
# We calculate these values dynamically so they update with your data
curr_price = df.iloc[-1]['close']
change = curr_price - df.iloc[-2]['close']
pct_change = (change / df.iloc[-2]['close']) * 100
color = "#f23645" if change < 0 else "#089981"

st.markdown(f"""
<div class="tv-header">
    <div class="tv-symbol-group">
        <div class="tv-icon">&#8383;</div>
        <div class="tv-symbol">Bitcoin / U.S. Dollar</div>
        <div class="tv-exchange">BINANCE</div>
    </div>
    <div class="tv-price-group">
        <div class="tv-price" style="color: {color}">{curr_price:,.2f}</div>
        <div class="tv-change" style="color: {color}">{change:+.2f} ({pct_change:+.2f}%)</div>
    </div>
</div>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 5. TIMEFRAME TOOLBAR
# -----------------------------------------------------------------------------
# We use st.columns to create a horizontal toolbar
st.markdown('<div style="background-color: white; border-bottom: 1px solid #e0e3eb; padding: 5px 20px;">', unsafe_allow_html=True)
cols = st.columns([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 6]) # Adjust spacing

timeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL']
selected_tf = st.session_state.timeframe

for i, tf in enumerate(timeframes):
    with cols[i]:
        # Highlight the selected button
        if st.button(tf, key=f"btn_{tf}", use_container_width=True):
            st.session_state.timeframe = tf
            st.rerun()

st.markdown('</div>', unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 6. CHART CONFIGURATION (White Theme)
# -----------------------------------------------------------------------------
chartOptions = {
    "layout": {
        "textColor": '#131722',
        "background": {
            "type": 'solid',
            "color": '#ffffff'  # Pure White Background
        }
    },
    "grid": {
        "vertLines": {"color": "rgba(42, 46, 57, 0.06)"}, # Very faint grid
        "horzLines": {"color": "rgba(42, 46, 57, 0.06)"}
    },
    "crosshair": {
        "mode": 1,
    },
    "rightPriceScale": {
        "borderColor": "rgba(197, 203, 206, 0.6)",
    },
    "timeScale": {
        "borderColor": "rgba(197, 203, 206, 0.6)",
        "timeVisible": True,
    }
}

# Prepare Data Series
series = [
    {
        "type": 'Candlestick',
        "data": [
            {"time": t.timestamp(), "open": o, "high": h, "low": l, "close": c}
            for t, o, h, l, c in zip(df['time'], df['open'], df['high'], df['low'], df['close'])
        ],
        "options": {
            "upColor": '#089981',     # TradingView Green
            "downColor": '#f23645',   # TradingView Red
            "borderVisible": False,
            "wickUpColor": '#089981',
            "wickDownColor": '#f23645'
        }
    },
    {
        "type": 'Line',  # The "Prediction" Line
        "data": [
            {"time": t.timestamp(), "value": v}
            for t, v in zip(future_dates, pred_prices)
        ],
        "options": {
            "color": '#2962ff',   # TradingView Blue
            "lineWidth": 2,
            "lineStyle": 2,       # Dashed
        }
    }
]

# -----------------------------------------------------------------------------
# 7. RENDER CHART
# -----------------------------------------------------------------------------
# We use a slightly custom height to fill the screen nicely
renderLightweightCharts([
    {
        "chart": {
            "height": 600,
            **chartOptions
        },
        "series": series
    }
], key="tv_chart")