# Crypto AI Trading Platform 🚀

A professional, TradingView-style web application for cryptocurrency trading with AI-powered price predictions. This platform combines real-time market data, advanced charting, and machine learning forecasts into a seamless dark-mode interface.

## ✨ Features

- **Live TradingView Charts**
  - Professional-grade candlestick charts powered by the official TradingView Widget.
  - Real-time data updates for multiple cryptocurrencies.
  - Customizable timeframes (1D, 4H, 1H, etc.).

- **AI Price Predictions**
  - **Multi-Coin Support:** Get predictions for BTC, ETH, SOL, BNB, ADA, XRP, DOT, DOGE, AVAX, and POL.
  - **Dynamic Forecasting:** The LSTM model adapts predictions based on the selected timeframe and market conditions.
  - **Confidence Metrics:** Real-time confidence scores and model accuracy indicators.
  - **Market Sentiment:** Visual gauge indicating Bullish/Bearish sentiment based on prediction trends.
  - **Key Drivers:** Analysis of volume, trend strength, and volatility.

- **Professional Trading Interface**
  - **Dark Theme:** Sleek, eye-friendly design matching professional trading terminals.
  - **Order Panel:** Simulation interface for Market and Limit orders with dynamic value calculation.
  - **Responsive Design:** Optimized for various screen sizes.

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** - High-performance frontend framework.
- **TradingView Widget** - Industry-standard charting library.
- **Lucide React** - Modern, crisp iconography.
- **CSS Variables** - Theming and consistent styling.

### Backend
- **Flask** - Lightweight Python web server.
- **TensorFlow/Keras** - LSTM (Long Short-Term Memory) neural network for time-series prediction.
- **Pandas & NumPy** - Data manipulation and numerical analysis.
- **Binance API** - Source for real-time and historical market data.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** & **npm**

### 1. Backend Setup

1.  **Install Python Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Start the API Server:**
    ```bash
    python api_server.py
    ```
    The backend will start on `http://localhost:5000`.
    *Note: The server will automatically load the pre-trained model (`models/market_model.h5`).*

### 2. Frontend Setup

1.  **Navigate to the Client Directory:**
    ```bash
    cd client
    ```

2.  **Install Node Modules:**
    ```bash
    npm install
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The application will open at `http://localhost:5173` (or the port shown in your terminal).

## 🧠 Model & Data

- **Architecture:** The core is an LSTM neural network trained on over 10 years of Bitcoin historical data.
- **Multi-Coin Logic:** The system uses Bitcoin as a baseline trend indicator and applies correlation coefficients to generate predictions for altcoins, adjusting for their specific volatility profiles.
- **Training:** You can retrain the model using the provided Jupyter notebook:
    1.  Open `train_model.ipynb`.
    2.  Run all cells to fetch new data, train the LSTM, and save the updated model.

## 🔌 API Endpoints

- **`GET /api/health`**
  - Returns the status of the API and loaded models.

- **`GET /api/predict`**
  - **Params:** `symbol` (e.g., BTCUSDT), `timeframe` (e.g., 1d).
  - **Returns:** Predicted price, confidence score, current price, and sentiment metrics.

- **`GET /api/historical`**
  - **Params:** `symbol`, `timeframe`, `limit`.
  - **Returns:** Historical OHLCV data for charting (used if TradingView widget is not available, currently serves as a data backup).

## 📂 Project Structure

```
TradingProject/
├── api_server.py          # Flask Backend Entry Point
├── data_engine.py         # Data Fetching Utility
├── train_model.ipynb      # Model Training Notebook
├── requirements.txt       # Python Dependencies
├── models/                # Saved ML Models (.h5, .pkl)
└── client/                # React Frontend
    ├── src/
    │   ├── components/    # UI Components (Header, PredictionPanel, etc.)
    │   ├── App.jsx        # Main Application Logic
    │   └── main.jsx       # Entry Point
    └── package.json       # Frontend Dependencies
```

## ⚠️ Disclaimer

This application is for **educational and demonstration purposes only**. The AI predictions are based on historical patterns and do not guarantee future results. Do not use this tool for real financial trading without proper risk assessment.

---

**Built with ❤️ for the Crypto Community.**
