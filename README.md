# Crypto AI Trading Platform 🚀

A professional, TradingView‑style web application for cryptocurrency trading with AI‑powered price predictions. This platform combines real‑time market data, advanced charting, and machine‑learning forecasts into a sleek dark‑mode interface.

## ✨ Features

- **Live TradingView Charts** – Real‑time candlestick charts for multiple cryptocurrencies.
- **AI Price Predictions** – Multi‑coin forecasts (BTC, ETH, SOL, BNB, ADA, XRP, DOT, DOGE, AVAX, POL) based on a Bitcoin‑centric LSTM model.
- **Market Sentiment Gauge** – Visual bullish/bearish indicator derived from the prediction trend.
- **Key Drivers** – Volume, trend strength, and volatility insights.
- **Dark Theme & Responsive Design** – Professional look on desktop and mobile.

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite, TradingView Widget, Lucide React, CSS variables.
- **Backend:** Flask, TensorFlow/Keras (LSTM), Pandas, NumPy, Binance REST API.

## 📦 Project Structure

```
TradingProject/
├── api_server.py          # Flask backend
├── data_engine.py         # Script to fetch historical CSV data
├── train_model.ipynb      # Model training notebook
├── requirements.txt       # Python deps
├── models/                # Saved model & scaler
├── data/                  # **Not committed** – generated CSV files
└── client/                # React frontend
    └── src/                # Components, styles, etc.
```

> **Note:** The `data/` folder (including `BTC_USD.csv`) is **not** tracked in the repository. It must be generated locally.

## 🚀 Getting Started (From Scratch)

### Prerequisites
- Python 3.8+ and `pip`
- Node.js 16+ and `npm`

### 1. Clone the Repository
```bash
git clone https://github.com/your‑username/TradingProject.git
cd TradingProject
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Acquire Historical Data
The project relies on a CSV file (`data/BTC_USD.csv`) containing Bitcoin price history. Since this file is excluded from Git, generate it locally:
```bash
python data_engine.py   # pulls data from Binance and writes to data/BTC_USD.csv
```
> **If you need data for other symbols**, edit `data_engine.py` to change the `SYMBOLS` list.

### 4. (Optional) Train / Update the Model
If you want to retrain the LSTM:
```bash
jupyter notebook train_model.ipynb   # run all cells to train and save model
```
The notebook saves `models/market_model.h5` and `models/market_scaler.pkl`.

### 5. Start the Backend API
```bash
python api_server.py
```
The server will listen on `http://localhost:5000` and automatically load the model and scaler.

### 6. Install Frontend Dependencies
```bash
cd client
npm install
```

### 7. Run the Frontend
```bash
npm run dev
```
Open the URL shown in the terminal (usually `http://localhost:5173`). The app will communicate with the backend to display predictions, sentiment, and key drivers.

## 📡 API Endpoints
- `GET /api/health` – Health check.
- `GET /api/predict?symbol=BTCUSDT&timeframe=1d` – Returns prediction, confidence, current price, and sentiment data.
- `GET /api/historical?symbol=BTCUSDT&timeframe=1d&limit=100` – Historical OHLCV data (fallback if TradingView widget is unavailable).

## ⚠️ Disclaimer
This application is for **educational purposes only**. Predictions are based on historical patterns and are not financial advice. Use at your own risk.

---

**Built with ❤️ for the crypto community.**
