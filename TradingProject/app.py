import streamlit as st
from streamlit_lightweight_charts import renderLightweightCharts
import pandas as pd
import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import os

# -----------------------------------------------------------------------------
# 1. SETUP
# -----------------------------------------------------------------------------
st.set_page_config(layout="wide", page_title="Unified Crypto AI")

st.markdown("""
<style>
    .block-container { padding: 0 !important; }
    header, footer { display: none !important; }
    .tv-header { background: white; padding: 15px; border-bottom: 1px solid #ddd; display: flex; align-items: center; }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 2. DEFINE BRAIN STRUCTURE (Bypass Version Conflict)
# -----------------------------------------------------------------------------
def build_model_structure():
    # We rebuild the EXACT same architecture here
    # Input shape: (60 days, 4 features)
    model = Sequential()
    model.add(LSTM(64, return_sequences=True, input_shape=(60, 4)))
    model.add(Dropout(0.2))
    model.add(LSTM(64, return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# -----------------------------------------------------------------------------
# 3. LOAD RESOURCES
# -----------------------------------------------------------------------------
@st.cache_resource
def load_resources():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # CRITICAL: Look for .h5 file
    model_path = os.path.join(base_dir, "models", "market_model.h5")
    scaler_path = os.path.join(base_dir, "models", "market_scaler.pkl")
    data_path = os.path.join(base_dir, "data", "MARKET_MASTER.csv")

    print(f"🔍 LOOKING FOR: {model_path}")

    if not os.path.exists(model_path):
        st.error(f"❌ Model missing at {model_path}. Please run training first.")
        st.stop()

    try:
        # 1. Build the empty shell
        model = build_model_structure()
        # 2. Pour the learned weights into it (Ignores version mismatch)
        model.load_weights(model_path)
        
        scaler = pickle.load(open(scaler_path, "rb"))
        df = pd.read_csv(data_path)
        return model, scaler, df
    except Exception as e:
        st.error(f"Error loading brain: {e}")
        st.stop()

model, scaler, df = load_resources()

# -----------------------------------------------------------------------------
# 4. PREDICTION ENGINE
# -----------------------------------------------------------------------------
def predict_next_7_days(model, scaler, df):
    feature_cols = ['BTC_Close', 'BTC_Vol', 'ETH_Close', 'ETH_Vol']
    last_60_days = df[feature_cols].values[-60:]
    
    scaled_input = scaler.transform(last_60_days)
    current_batch = scaled_input.reshape(1, 60, 4) 
    
    future_prices = []
    
    for i in range(7): 
        next_pred = model.predict(current_batch, verbose=0)
        
        dummy_row = np.zeros((1, 4))
        dummy_row[0, 0] = next_pred 
        price = float(scaler.inverse_transform(dummy_row)[0][0])
        future_prices.append(price)
        
        new_row = current_batch[0, -1, :].copy() 
        new_row[0] = next_pred 
        new_row = new_row.reshape(1, 1, 4)
        current_batch = np.append(current_batch[:, 1:, :], new_row, axis=1)

    last_time = pd.to_datetime(df.iloc[-1]['Date'])
    future_times = [(last_time + pd.Timedelta(days=i+1)).timestamp() for i in range(7)]
    
    return future_times, future_prices

future_times, future_prices = predict_next_7_days(model, scaler, df)

# -----------------------------------------------------------------------------
# 5. VISUALIZE
# -----------------------------------------------------------------------------
df['timestamp'] = pd.to_datetime(df['Date']).apply(lambda x: x.timestamp())
candle_df = df[['timestamp', 'BTC_Open', 'BTC_High', 'BTC_Low', 'BTC_Close']].copy()
candle_df.columns = ['time', 'open', 'high', 'low', 'close']
candle_data = candle_df.astype(float).to_dict('records')

series_pred = {
    "type": 'Line',
    "data": [{"time": float(t), "value": float(p)} for t,p in zip(future_times, future_prices)],
    "options": { "color": '#2962ff', "lineWidth": 2, "lineStyle": 2, "title": "AI Forecast" }
}

curr_price = df.iloc[-1]['BTC_Close']

st.markdown(f"""
<div class="tv-header">
    <span style="font-size: 22px; font-weight: bold;">₿ BTC/USD (Unified Market Model)</span>
    <span style="font-size: 22px; margin-left: auto;">${curr_price:,.2f}</span>
</div>
""", unsafe_allow_html=True)

renderLightweightCharts([
    {
        "chart": {"height": 600, "layout": {"textColor": "#333", "background": {"type": "solid", "color": "white"}}},
        "series": [
            {
                "type": 'Candlestick',
                "data": candle_data,
                "options": { "upColor": '#089981', "downColor": '#f23645', "borderVisible": False, "wickUpColor": '#089981', "wickDownColor": '#f23645' }
            },
            series_pred
        ]
    }
], key="unified_chart")